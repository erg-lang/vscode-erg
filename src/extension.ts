import { ExtensionContext, commands, window, workspace } from "vscode";
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from "vscode-languageclient/node";
import { spawn } from "child_process";
import { showReferences } from "./commands";

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
		const enableInlayHints = workspace.getConfiguration("vscode-erg").get<boolean>("lsp.inlayHints", true);
		const enableSemanticTokens = workspace.getConfiguration("vscode-erg").get<boolean>("lsp.semanticTokens", true);
		const enableHover = workspace.getConfiguration("vscode-erg").get<boolean>("lsp.hover", true);
		const smartCompletion = workspace.getConfiguration("vscode-erg").get<boolean>("lsp.smartCompletion", true);
		/* optional features */
		const checkOnType = workspace.getConfiguration("vscode-erg").get<boolean>("lsp.checkOnType", false);
		const lint = workspace.getConfiguration("vscode-erg").get<boolean>("lsp.lint", false);
		let args = ["language-server", "--"];
		if (!enableInlayHints) {
			args.push("--disable");
			args.push("inlayHints");
		}
		if (!enableSemanticTokens) {
			args.push("--disable");
			args.push("semanticTokens");
		}
		if (!enableHover) {
			args.push("--disable");
			args.push("hover");
		}
		if (!smartCompletion) {
			args.push("--disable");
			args.push("smartCompletion");
		}
		if (checkOnType) {
			args.push("--enable");
			args.push("checkOnType");
		}
		if (lint) {
			args.push("--enable");
			args.push("lint");
		}
		let serverOptions: ServerOptions;
		if (buildFeatures.includes("els")) {
			serverOptions = {
				command: executablePath,
				args,
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
		window.showErrorMessage(`${e}`);
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
		window.showErrorMessage(`${e}`);
	}
}

export async function activate(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand("erg.restartLanguageServer", () => restartLanguageClient())
	);
	context.subscriptions.push(
		commands.registerCommand("erg.showReferences", async (uri, position, locations) => {
			await showReferences(client, uri, position, locations)
		})
	);
	await startLanguageClient(context);
}

export function deactivate() {
	if (client) {
		return client.stop();
	}
}
