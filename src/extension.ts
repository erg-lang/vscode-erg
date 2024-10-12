import { type ExtensionContext, commands, window, workspace } from "vscode";
import {
	LanguageClient,
	type LanguageClientOptions,
	type ServerOptions,
} from "vscode-languageclient/node";
import { spawn } from "node:child_process";
import { showReferences } from "./commands";
import { checkForUpdate } from "./update";

let client: LanguageClient | undefined;

async function startLanguageClient(context: ExtensionContext) {
	try {
		const executablePath = (() => {
			const executablePath = workspace
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
		const enableDiagnostics = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.diagnostics", true);
		const enableInlayHints = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.inlayHints", true);
		const enableSemanticTokens = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.semanticTokens", true);
		const enableHover = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.hover", true);
		const enableCompletion = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.completion", true);
		const enableCodeAction = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.codeAction", true);
		const enableCodeLens = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.codeLens", true);
		const enableSignatureHelp = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.signatureHelp", true);
		const enableDocumentHighlight = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.documentHighlight", true);
		const enableDocumentLink = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.documentLink", true);
		const enableSelectionRange = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.selectionRange", true);
		const smartCompletion = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.smartCompletion", true);
		/* optional features */
		const checkOnType = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.checkOnType", false);
		const lint = workspace
			.getConfiguration("vscode-erg")
			.get<boolean>("lsp.lint", false);
		const args = ["language-server", "--"];
		if (!enableDiagnostics) {
			args.push("--disable");
			args.push("diagnostics");
		}
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
		if (!enableCompletion) {
			args.push("--disable");
			args.push("completion");
		}
		if (!enableCodeAction) {
			args.push("--disable");
			args.push("codeAction");
		}
		if (!enableCodeLens) {
			args.push("--disable");
			args.push("codeLens");
		}
		if (!enableSignatureHelp) {
			args.push("--disable");
			args.push("signatureHelp");
		}
		if (!enableDocumentHighlight) {
			args.push("--disable");
			args.push("documentHighlight");
		}
		if (!enableDocumentLink) {
			args.push("--disable");
			args.push("documentLink");
		}
		if (!enableSelectionRange) {
			args.push("--disable");
			args.push("selectionRange");
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
	const checkForUpdates = workspace
		.getConfiguration("vscode-erg")
		.get<boolean>("checkForUpdates", true);
	if (checkForUpdates) {
		await checkForUpdate();
	}
	context.subscriptions.push(
		commands.registerCommand("erg.restartLanguageServer", () =>
			restartLanguageClient(),
		),
	);
	context.subscriptions.push(
		commands.registerCommand(
			"erg.showReferences",
			async (uri, position, locations) => {
				await showReferences(client, uri, position, locations);
			},
		),
	);
	await startLanguageClient(context);
}

export function deactivate() {
	if (client) {
		return client.stop();
	}
}
