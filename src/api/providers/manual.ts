import { Anthropic } from "@anthropic-ai/sdk"
import { ApiHandler } from ".."
import { ApiHandlerOptions, ModelInfo } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import * as vscode from "vscode"
import * as fs from "fs"

export class ManualHandler implements ApiHandler {
	private readonly extensionUri: vscode.Uri

	constructor(options: ApiHandlerOptions, extensionUri: vscode.Uri) {
		this.extensionUri = extensionUri
	}

	countTokens(content: Array<Anthropic.Messages.ContentBlockParam>): Promise<number> {
        return Promise.resolve(content.length / 4);
    }

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const response = await new Promise<string>((resolve) => {
			const panel = vscode.window.createWebviewPanel("manualInput", "Manual Input", vscode.ViewColumn.One, {
				enableScripts: true,
				localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "dist", "webview")],
			})

			panel.webview.html = getWebviewContent(panel.webview, this.extensionUri)

			panel.webview.onDidReceiveMessage((message) => {
				if (message.type === "submitResponse") {
					panel.dispose()
					resolve(message.response)
				} else if (message.type === "documentReady") {
					// Send initializeData when document is ready
					panel.webview.postMessage({
						type: "initializeData",
						systemPrompt: systemPrompt,
						messages: this.getRequest(messages),
						messageCount: messages.length,
					})
				}
			})
		})

		yield {
			type: "text",
			text: response,
		}

		const inputTextLength =
			systemPrompt.length +
			messages.reduce((acc, msg) => {
				if (Array.isArray(msg.content)) {
					return (
						acc +
						msg.content
							.filter((block) => block.type === "text")
							.reduce((sum, block) => sum + (block as Anthropic.Messages.TextBlockParam).text.length, 0)
					)
				}
				return acc + (msg.content as string).length
			}, 0)

		const outputTextLength = response.length

		yield {
			type: "usage",
			inputTokens: Math.ceil(inputTextLength / 3),
			outputTokens: Math.ceil(outputTextLength / 3),
		}
	}

	private getRequest(messages: Anthropic.Messages.MessageParam[]): string {
		return messages.length > 0
			? Array.isArray(messages[messages.length - 1].content)
				? (
						messages[messages.length - 1].content as Array<
							| Anthropic.Messages.TextBlockParam
							| Anthropic.Messages.ImageBlockParam
							| Anthropic.Messages.ToolUseBlockParam
							| Anthropic.Messages.ToolResultBlockParam
						>
					)
						.filter((block) => block.type === "text")
						.map((block) => (block as Anthropic.Messages.TextBlockParam).text)
						.join("\n")
				: (messages[messages.length - 1].content as string)
			: ""
	}

	getModel(): { id: string; info: ModelInfo } {
		return { id: "Manual chat", info: { supportsPromptCache: false, supportsImages: false, contextWindow: 1_000_000, maxTokens: 1_000_000, inputPrice: 3.0, outputPrice: 15.0 } }
	}
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
	const htmlPath = vscode.Uri.joinPath(extensionUri, "dist", "webview", "manualInput.html")
	const html = fs.readFileSync(htmlPath.fsPath, "utf8")
	return html
}
