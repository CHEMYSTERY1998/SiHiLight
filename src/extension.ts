import * as vscode from 'vscode';
import {Hightlighter} from './highlight';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "SiHiLight" is now active!');
	vscode.window.showInformationMessage('SiHiLight 插件已激活！');
	Hightlighter.getInstance().context = context;

	const addHighLight = vscode.commands.registerCommand('SiHiLight.addHighlight', () => {
		Hightlighter.getInstance().addHighLight(vscode.window.activeTextEditor);
	});

	const removeAllHighlights = vscode.commands.registerCommand('SiHiLight.removeAllHighlights', () => {
		Hightlighter.getInstance().removeAllHighLight(vscode.window.activeTextEditor);
	});

	const copyHighlightWords = vscode.commands.registerCommand('SiHiLight.copyHighlightWords', () => {
		Hightlighter.getInstance().copyHighlightWords();
	});

	context.subscriptions.push(addHighLight, removeAllHighlights, copyHighlightWords);
}

// This method is called when your extension is deactivated
export function deactivate() {}
