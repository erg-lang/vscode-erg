import { LanguageClientOptions } from "vscode-languageclient";
import { ExtensionContext, window } from "vscode";
import { LanguageClient, ServerOptions } from "vscode-languageclient/node";

let client: LanguageClient | undefined;

export async function activate(context: ExtensionContext) {
	try {
		const serverOptions = {
			command: "els",
			args: [],
		} satisfies ServerOptions;
		const clientOptions = {
			documentSelector: [
				{
					scheme: "file",
					language: "erg",
				},
			],
		} satisfies LanguageClientOptions;
		client = new LanguageClient("els", serverOptions, clientOptions);
		context.subscriptions.push(client.start());
	} catch (e) {
		window.showErrorMessage("failed to start els.");
	}
}

export function deactivate() {
	if (client) return client.stop();
}
