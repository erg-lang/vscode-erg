import { window, workspace } from "vscode";
import { spawn } from "node:child_process";
import { compare } from "compare-versions";

async function currentErgVersion() {
	let version = "";
	const executablePath = (() => {
		const executablePath = workspace
			.getConfiguration("vscode-erg")
			.get<string>("executablePath", "");
		return executablePath === "" ? "erg" : executablePath;
	})();
	const versionProcess = spawn(executablePath, ["--version"]);
	for await (const chunk of versionProcess.stdout) {
		version += chunk;
	}
	while (versionProcess.exitCode === null) {
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	if (versionProcess.exitCode !== 0) {
		return undefined;
	}
	return `v${version.split(" ")[1].trimEnd()}`;
}

async function latestErgVersion(): Promise<string | undefined> {
	let version = "";
	const versionProcess = spawn("curl", [
		"https://api.github.com/repos/erg-lang/erg/releases/latest",
	]);
	for await (const chunk of versionProcess.stdout) {
		version += chunk;
	}
	while (versionProcess.exitCode === null) {
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	if (versionProcess.exitCode !== 0) {
		return undefined;
	}
	return JSON.parse(version).tag_name;
}

export async function checkForUpdate() {
	const currentVersion = await currentErgVersion();
	const latestVersion = await latestErgVersion();
	if (latestVersion === undefined) {
		// window.showErrorMessage("Failed to check the latest version of Erg.");
		return;
	}
	if (currentVersion === undefined) {
		const selection = await window.showInformationMessage(
			"Erg is not installed.",
			"Install",
		);
		if (selection === "Install") {
			await updateToolchain();
		}
	} else if (compare(currentVersion, latestVersion, "<")) {
		const selection = await window.showInformationMessage(
			`A new version of Erg is available. Current version: ${currentVersion}, Latest version: ${latestVersion}`,
			"Update",
			"Not now",
		);
		if (selection === "Update") {
			await updateToolchain();
		}
	}
}

async function updateToolchain() {
	const terminal = window.createTerminal("Erg Update");
	terminal.show(true);
	setTimeout(() => {}, 500);
	const result = new Promise((resolve) => {
		window.onDidCloseTerminal((t) => {
			if (t === terminal) {
				resolve(true);
			}
		});
	});
	terminal.sendText(
		"echo y | python3 <(curl -L https://github.com/mtshiba/ergup/raw/main/ergup.py) && exit",
	);
	await result;
}
