"use strict";
const vscode = require("vscode");
const languageclient = require("vscode-languageclient");

let client;

function activate(context) {
    try {
        const serverOptions = {
            command: "els",
            args: []
        };
        const clientOptions = {
            documentSelector: [
                {
                    scheme: "file",
                    language: "erg",
                }
            ],
        };
        client = new languageclient.LanguageClient("els", serverOptions, clientOptions);
        context.subscriptions.push(client.start());
    } catch (e) {
        vscode.window.showErrorMessage("failed to start els.");
    }
}

function deactivate() {
    if (client) return client.stop();
}

module.exports = { activate, deactivate }
