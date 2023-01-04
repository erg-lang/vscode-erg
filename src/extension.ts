// import { LanguageClientOptions } from "vscode-languageclient";
import { ExtensionContext, window } from "vscode";
import { LanguageClient, ServerOptions } from "vscode-languageclient/node";
import { spawnSync } from "child_process";

let client: LanguageClient | undefined;

export async function activate_els(context: ExtensionContext) {
    let serverOptions;
    let result = spawnSync("erg", ["--build-features"]);
    if (result.stdout.toString().includes("els")) {
        serverOptions = {
            command: "erg",
            args: ["--language-server"]
        };
    } else {
        serverOptions = {
            command: "els",
            args: []
        };
    }
    const clientOptions = {
        documentSelector: [
            {
                scheme: "file",
                language: "erg",
            }
        ],
    };
    client = new LanguageClient("els", serverOptions, clientOptions);
    context.subscriptions.push(client.start());
}

export async function activate(context: ExtensionContext) {
    try {
        activate_els(context);
    } catch (e) {
        window.showErrorMessage("Failed to start ELS (Erg Language Server). Please make sure you have erg (built with `els` feature) or els installed.");
    }
}

export function deactivate() {
	if (client) {
		return client.stop();
	}
}
