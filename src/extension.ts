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

	const copyFileName = vscode.commands.registerCommand('SiHiLight.copyFileName', (uri: vscode.Uri | undefined) => {
		let fileName = '';
		// 从资源管理器右键菜单调用时，uri 参数会被传入
		if (uri && uri.scheme === 'file') {
			fileName = uri.fsPath;
		} else {
			// 从命令面板调用时，使用活动编辑器
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor && activeEditor.document.uri.scheme === 'file') {
				fileName = activeEditor.document.fileName;
			}
		}
		if (fileName) {
			// 提取文件名（不包含路径）
			const name = fileName.split(/[\\/]/).pop() || fileName;
			vscode.env.clipboard.writeText(name);
			vscode.window.showInformationMessage(`已复制文件名: ${name}`);
		} else {
			vscode.window.showWarningMessage('没有选中的文件');
		}
	});

	context.subscriptions.push(addHighLight, removeAllHighlights, copyHighlightWords, copyFileName);
}

// This method is called when your extension is deactivated
export function deactivate() {}
