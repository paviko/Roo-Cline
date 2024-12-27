import * as vscode from "vscode";
import { ClineProvider } from "../ClineProvider";

interface KebabButtonOption {
    value: string;
    label: string;
}

export const KebabButtonOptions = {
    SendErrorProblems: {
        value: "SendErrorProblems",
        label: "Send Error/Problems"
    },
    SendMCPToolsInSystemPrompt: {
        value: "SendMCPToolsInSystemPrompt",
        label: "Send MCP Tools in System Prompt"
    },
    SendNextStepsReminderWithReject: {
        value: "SendNextStepsReminderWithReject",
        label: "Send Next Steps reminder with Reject"
    }
} as const;

export function registerKebabButtonCommand(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
    return vscode.commands.registerCommand("roo-cline.kebabButtonClicked", async () => {
        const visibleProvider = ClineProvider.getVisibleInstance();
        if (!visibleProvider) {
            return;
        }

        // Get current state
        const state = await visibleProvider.getGlobalState("quickSettings") as Record<string, boolean>;

        const checkboxItems: vscode.QuickPickItem[] = Object.values(KebabButtonOptions).map(option => ({
            label: option.label,
            picked: state?.[option.value] ?? true
        }));

        const selectedItems = await vscode.window.showQuickPick(checkboxItems, {
            canPickMany: true,
            placeHolder: "Select options",
        });

        outputChannel.appendLine("Selected items logged to console");
        if (selectedItems) {
            console.log("Selected items:", selectedItems);
            outputChannel.appendLine(`Selected items: ${selectedItems.map(item => item.label).join(", ")}`);

            // Convert selected items to Record<string, boolean>
            const selectionsRecord = {} as Record<string, boolean>;
            Object.values(KebabButtonOptions).forEach(option => {
                selectionsRecord[option.value] = selectedItems.some(
                    selectedItem => selectedItem.label === option.label
                );
            });

            // Update state with selected items
            await visibleProvider.updateGlobalState("quickSettings", selectionsRecord);
        }
    });
}
