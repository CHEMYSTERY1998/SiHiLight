# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

SiHiLight 是一个 VS Code 扩展，提供类似 Source Insight 的文本高亮功能。用户可以用多种颜色高亮选中的文本/单词、复制高亮单词以及移除所有高亮。

## 开发命令

- `npm run compile` - 将 TypeScript 编译到 `out/` 目录
- `npm run watch` - 监听模式编译（后台运行，默认构建任务）
- `npm run lint` - 对 `src/` 目录运行 ESLint
- `npm run test` - 使用 vscode-test 运行测试
- `npm run pack` - 使用 vsce 将扩展打包为 `.vsix` 文件

## 代码架构

扩展采用简单的双层架构：

### 入口文件: `src/extension.ts`
- `activate(context)` - 扩展激活入口，注册命令，初始化 Hightlighter 单例
- `deactivate()` - 扩展停载时的清理工作

### 核心逻辑: `src/highlight.ts`
`Hightlighter` 类实现单例模式，负责：
- **装饰器管理**：为 `SiHiLight.colors` 配置中的每种颜色创建 `vscode.TextEditorDecorationType`
- **高亮存储**：维护 `words` 数组，存储已高亮的文本模式（已做正则转义）
- **事件监听**：编辑器/文档变化时自动刷新高亮
- **命令方法**：
  - `addHighLight(editor)` - 切换选中文本或光标处单词的高亮状态
  - `removeAllHighLight(editor)` - 清除所有高亮
  - `copyHighlightWords()` - 将所有高亮单词复制到剪贴板
  - `updateDecorations(active?)` - 根据 `fullMatch` 和 `ignoreCase` 配置，使用正则匹配应用装饰器

### 主题文件: `theme/*.json`
- `dark_vs.json`, `light_vs.json` - VS Code 默认主题
- `si_dark.json`, `si_light.json` - 自定义 Source Insight 风格主题

## 配置项

颜色和匹配行为通过 VS Code 设置配置：
- `SiHiLight.colors` - `{light, dark}` 颜色对象数组
- `SiHiLight.highlightSetting.fullMatch` - 全词匹配（默认: true）
- `SiHiLight.highlightSetting.ignoreCase` - 忽略大小写（默认: false）
