import { ExtensionContext, commands, window } from "vscode";
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from "vscode-languageclient/node";
import { spawn } from "child_process";

let client: LanguageClient | undefined;

async function startLanguageClient(context: ExtensionContext) {
	try {
		const buildFeatures = spawn("erg", ["--build-features"]);
		let result = "";
		for await (const chunk of buildFeatures.stdout) {
			console.log(chunk);
			result += chunk;
		}
		let serverOptions: ServerOptions;
		if (result.includes("els")) {
			serverOptions = {
				command: "erg",
				args: ["--language-server"],
			};
		} else {
			serverOptions = {
				command: "els",
				args: [],
			};
		}
		const clientOptions: LanguageClientOptions = {
			documentSelector: [
				{
					scheme: "file",
					language: "erg",
				},
			],
		};
		client = new LanguageClient("els", serverOptions, clientOptions);
		context.subscriptions.push(client.start());
	} catch (e) {
		window.showErrorMessage(
			"Failed to start ELS (Erg Language Server). Please make sure you have erg (built with `els` feature) or els installed.",
		);
	}
}

async function restartLanguageClient(context: ExtensionContext) {
	if (client === undefined) {
		window.showErrorMessage("Failed to restart ELS (Erg Language Server).");
		return;
	}
	await client.stop();
	client.outputChannel.dispose();
	await startLanguageClient(context);
}

export async function activate(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand("erg.restartLanguageServer", () =>
			restartLanguageClient(context),
		),
	);
	await startLanguageClient(context);
}

export function deactivate() {
	if (client) {
		return client.stop();
	}
}
