import * as vscode from 'vscode';

/**
 * 提供高亮功能的工具类（单例模式）
 */
export class Hightlighter {
    private static _instance: Hightlighter;
    /** 当前高亮的单词列表 */
    private words: string[] = [];
    /** 装饰器数组，用于不同颜色的高亮 */
    private decorators: vscode.TextEditorDecorationType[] = [];

    public context?: vscode.ExtensionContext;

    private constructor() {
        // 构造函数中初始化装饰器
        const config = vscode.workspace.getConfiguration('SiHiLight');
        if (!config) {
            console.error('[Hightlighter] SiHiLight 配置未找到');
            vscode.window.showErrorMessage('SiHiLight 配置未找到，请检查插件设置');
            return;
        }
        console.log('[Hightlighter] SiHiLight 配置已加载', config);
        const colors: any[] = config.get('colors') as {
            light: string;
            dark: string;
        }[];
        this.decorators = [];
        if (!colors || !colors.length) {
            console.error('[Hightlighter] 未配置高亮颜色');
            vscode.window.showErrorMessage('未配置高亮颜色，请在设置中配置 SiHiLight.colors');
            return;
        }
        colors.forEach((color, idx) => {
            const decorationType = vscode.window.createTextEditorDecorationType({
                borderStyle: 'solid',
                borderWidth: '2px',
                dark: {
                    backgroundColor: color.dark,
                    borderColor: color.dark,
                    color: '#FFFFFF',
                    fontWeight: 'bolder',
                    overviewRulerColor: color.dark,
                },
                light: {
                    backgroundColor: color.light,
                    borderColor: color.light,
                    color: '#000000',
                    fontWeight: 'bolder',
                    overviewRulerColor: color.light,
                },
                overviewRulerLane: vscode.OverviewRulerLane.Right,
            });
            this.decorators.push(decorationType);
        });

        // 监听可见编辑器变化，自动刷新高亮
        vscode.window.onDidChangeVisibleTextEditors((editor) => {
            this.updateDecorations();
        }, null, this.context?.subscriptions);

        // 监听文档内容变化，自动刷新高亮
        vscode.workspace.onDidChangeTextDocument((event) => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && event.document === activeEditor.document) {
                this.updateDecorations(true);
            }
        }, null, this.context?.subscriptions);
        vscode.window.showInformationMessage('高亮工具已初始化！');
    }

    public static getInstance(): Hightlighter {
        if (!Hightlighter._instance) {
            Hightlighter._instance = new Hightlighter();
        }
        return Hightlighter._instance;
    }

    private getSelectedTextOrWord(editor: vscode.TextEditor | undefined): string[] | undefined {
        if (!editor) {
            return undefined;
        }
        const selections = editor.selections;
        if (!selections || selections.length === 0) {
            console.error('未选择文本');
            return;
        }
        const selectedTexts = selections.map(sel => {
            let word: string = editor.document.getText(sel);
            if (!word) {
                // 如果没有选中文本，则获取光标所在单词
                const range = editor.document.getWordRangeAtPosition(sel.start);
                if (range) {
                    word = editor.document.getText(range);
                }
            }
            return word || '';
        });
        return selectedTexts.map(word => word.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'));// 转义正则特殊字符
    }

    public addHighLight(editor: vscode.TextEditor | undefined) {
        let words = this.getSelectedTextOrWord(editor);
        if (!words || words.length === 0) {
            console.warn('[Hightlighter] 没有选中任何文本');
            return;
        }
        words.map(word => {
            // 检查是否已存在该高亮，避免重复
            const idx = this.words.findIndex((w) => w === word);
            if (idx === -1) {
                this.words.push(word);
            } else {
                this.words.splice(idx, 1);
            }
            this.updateDecorations();
        })
    }

    public removeAllHighLight(editor: vscode.TextEditor | undefined) {
        this.words = [];
        this.updateDecorations();
    }

    public updateDecorations(active?: boolean) {
        if (!vscode.window.visibleTextEditors?.length) {
            console.warn('[Hightlighter] 没有可见编辑器');
            return;
        }
        const activeDoc = vscode.window.activeTextEditor?.document;
        if (!this.decorators?.length || !this.words?.length) {
            console.warn('[Hightlighter] 没有装饰器或没有高亮单词');
            // 清空所有装饰
            vscode.window.visibleTextEditors.forEach((editor) => {
                this.decorators.forEach((d) => {
                    editor.setDecorations(d, []);
                });
            });
            return;
        }
        vscode.window.visibleTextEditors.forEach((editor, editorIdx) => {
            // 只更新当前活动文档（如果指定）
            if (active && editor.document !== activeDoc) {
                return;
            }
            const text = editor.document.getText();
            const config = vscode.workspace.getConfiguration('SiHiLight');
            const highlight = config.get("highlightSetting") as {
                fullMatch: boolean;
                ignoreCase: boolean;
            };
            // 为每个装饰器准备一个数组
            const decs: vscode.DecorationOptions[][] = this.decorators.map(() => []);
            this.words.forEach((w, n) => {
                const expression = highlight.fullMatch ? `\\b${w}\\b` : w;
                const opts = highlight.ignoreCase ? 'gi' : 'g';
                const regEx = new RegExp(expression, opts);
                let match: RegExpExecArray | null;
                let matchCount = 0;
                while ((match = regEx.exec(text))) {
                    const startPos = editor.document.positionAt(match.index);
                    const endPos = editor.document.positionAt(match.index + match[0].length);
                    decs[n % decs.length].push({ range: new vscode.Range(startPos, endPos) });
                    matchCount++;
                }
            });
            // 应用装饰器到编辑器
            this.decorators.forEach((d, i) => {
                editor.setDecorations(d, decs[i]);
            });
        });
    }
}