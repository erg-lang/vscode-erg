# Erg language support for Visual Studio Code

<a href="https://marketplace.visualstudio.com/items?itemName=erg-lang.vscode-erg" target="_blank" rel="noreferrer noopener nofollow"><img src="https://img.shields.io/visual-studio-marketplace/v/erg-lang.vscode-erg?style=flat&amp;label=VS%20Marketplace&amp;logo=visual-studio-code" alt="vsm-version"></a>

This extension provides syntax highlighting and basic supports (diagnostics & code completion) for the [Erg](https://github.com/erg-lang/erg) programming language.

## Requirements

~~You need to have the [Erg language server](https://github.com/erg-lang/erg/tree/main/compiler/els#readme) installed on your system.~~

~~To install it, you need to install or build Erg with `--features els`.~~

The extension installs the Erg toolchain automatically. If you see a message "Erg is not installed.", press the "Install" button.
After installing, you should set `PATH` to the directory stores the `erg` executable and `ERG_PATH` to the `.erg` directory.
Usually, the `.erg` directory is located in `~` and the `erg` executable is located in `~/.erg/bin`.

Building from source code is recommended if you want to have the latest complete ELS experience.

## Configuration

### General

* `vscode-erg.ergpath.path`: Path to the `.erg` directory. Default is `~/.erg`.
* `vscode-erg.executablePath`: Path to the `erg` executable. Default is `erg`.
* `vscode-erg.checkForUpdates`: Check for updates on startup. Default is `true`.

### Language Server

* `vscode-erg.lsp.inlayHints`: Enable inlay hints. Default is `true`.
* `vscode-erg.lsp.semanticTokens`: Enable semantic tokens. Default is `true`.
* `vscode-erg.lsp.hover`: Enable hover. Default is `true`.
* `vscode-erg.lsp.smartCompletion`: Enable smart completion (see [ELS features](https://github.com/erg-lang/erg/blob/main/crates/els/doc/features.md)). Default is `true`.
* `vscode-erg.lsp.lint`: Enable linting. Default is `true`.

## How to build (for contributors)

```sh
npm install -g vsce
npm install
npx vsce package
```
