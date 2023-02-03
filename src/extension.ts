import { ExtensionContext, commands, window, workspace } from "vscode";
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from "vscode-languageclient/node";
import { spawn } from "child_process";

let client: LanguageClient | undefined;

async function startLanguageClient(context: ExtensionContext) {
	try {
		const executablePath = (() => {
			let executablePath = workspace
				.getConfiguration("vscode-erg")
				.get<string>("executablePath", "");
			return executablePath === "" ? "erg" : executablePath;
		})();
		const buildFeatures = await (async () => {
			const buildFeaturesProcess = spawn(executablePath, ["--build-features"]);
			let buildFeatures = "";
			for await (const chunk of buildFeaturesProcess.stdout) {
				buildFeatures += chunk;
			}
			return buildFeatures;
		})();
		let serverOptions: ServerOptions;
		if (buildFeatures.includes("els")) {
			serverOptions = {
				command: executablePath,
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
		await client.start();
	} catch (e) {
		window.showErrorMessage(
			"Failed to start ELS (Erg Language Server). Please make sure you have erg (built with `els` feature) or els installed.",
		);
	}
}

async function restartLanguageClient() {
	try {
		if (client === undefined) {
			throw new Error();
		}
		await client.restart();
	} catch (e) {
		window.showErrorMessage("Failed to restart ELS (Erg Language Server).");
	}
}

export async function activate(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand("erg.restartLanguageServer", () =>
			restartLanguageClient(),
		),
	);
	await startLanguageClient(context);
}

export function deactivate() {
	if (client) {
		return client.stop();
	}
}
