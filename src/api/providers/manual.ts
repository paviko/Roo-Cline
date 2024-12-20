import { Anthropic } from "@anthropic-ai/sdk"
import { ApiHandler } from ".."
import { ApiHandlerOptions, ModelInfo } from "../../shared/api"
import { ApiStream } from "../transform/stream"

export class ManualHandler implements ApiHandler {
	constructor(options: ApiHandlerOptions) {
	}

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		yield {
			type: "text",
			text: `
<attempt_completion>
<result>
Hello world!
</result>
</attempt_completion>`,
		}

		yield {
			type: "usage",
			inputTokens: 100,
			outputTokens: 100,
		}
	}

	getModel(): { id: string; info: ModelInfo; } {
		return { id: "Manual chat", info: { supportsPromptCache: false } }
	}
}
