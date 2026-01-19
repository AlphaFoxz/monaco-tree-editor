# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**monaco-tree-editor** is a Vue 3 library that provides a VSCode-like web editor component with an integrated file tree. It's built on Monaco Editor and designed to be embedded in Vue 3 applications.

- **Version**: 1.2.0-alpha.1
- **License**: Apache-2.0
- **Repository**: https://github.com/AlphaFoxz/monaco-tree-editor
- **Node requirement**: 18.18.0+
- **Package manager**: pnpm (recommended)

## Development Commands

```bash
pnpm dev                    # Start development server
pnpm build                  # Full build: compile, type-check, sync files
pnpm build:compile          # Compile TypeScript to dist/
pnpm verify                 # Type checking with vue-tsc
pnpm build:sync-file        # Copy README/LICENSE to dist

# Testing
pnpm test:start-server      # Start test server on random port
pnpm cy:open                # Open Cypress test runner
pnpm cy:run                 # Run Cypress tests headless
```

## Architecture

### Domain-Driven Aggregation Pattern

The codebase uses a custom aggregation pattern via the `vue-fn` library. Core domains are in [lib/domain/](lib/domain/):

- **monaco-agg** - Monaco editor state, file management, model creation/updates
- **global-settings-agg** - Theme mode, language, file locking, UI state
- **hotkey-agg** - Keyboard shortcuts system with command binding
- **message-agg** - Global notification system
- **i18n-agg** - Internationalization support

### Aggregation Structure

Each aggregation exports:
- `states` - Reactive state properties (Vue refs/reactive objects)
- `commands` - Action methods for state manipulation
- `events` - Event publishing/subscribing (using `createBroadcastEvent`, `createRequestEvent`)

### Instance Types

- **Singleton aggregations** (`createSingletonAgg`): Only one instance globally (e.g., `global-settings-agg`, `message-agg`)
- **Multi-instance aggregations** (`createMultiInstanceAgg`): Multiple instances identified by ID (e.g., `monaco-agg`, `hotkey-agg`)

The default monaco instance ID is `'default'`. When working with multiple editor instances, use unique instance IDs.

### Domain Plugins

[lib/domain-plugin/](lib/domain-plugin/) contains plugin extensions that hook into aggregations:

- `hotkey-store.ts` - Persists keyboard shortcuts to localStorage, hooks into `hotkey-agg` lifecycle

Plugins use `createSetupPlugin()` to mount during aggregation initialization.

### Main Library Entry

[lib/index.ts](lib/index.ts) exports:
- `Editor` - Main editor component
- `useMonaco()` - Monaco aggregation composable
- `useGlobalSettings()` - Global settings composable
- `useHotkey()` - Hotkey aggregation composable
- `useMessage()` - Message system composable
- `HOTKEY_STORE_PLUGIN` - Plugin for persisting shortcuts

### Path Aliases

```typescript
'#lib/*'        -> ./lib/*
'#domain/*'     -> ./lib/domain/*
'#domain-plugin/*' -> ./lib/domain-plugin/*
'#icons/*'      -> ./lib/icons/*
'#components/*' -> ./lib/components/*
'#pages/*'      -> ./lib/pages/*
```

## Key Implementation Details

### File Tree Loading

The `monaco-agg` handles file tree loading asynchronously via `loadFileTree()`. Files are converted to Monaco models using `createOrUpdateModel()`. Built-in pages (Settings, KeyboardShortcuts) are special-cased via the `BuiltInPage` enum.

### Monaco Lifecycle

1. DOM must be mounted first via `mountMonacoToDom()`
2. Creates a deferred promise resolved when DOM is ready
3. File tree loading waits for DOM mount via `untilDomMounted()`
4. Models are created for all file contents after DOM is ready

### Editor Instance Management

When working with Monaco editor directly, access via:
```typescript
const monacoAgg = useMonaco(monacoLib, 'default')
await monacoAgg.commands.untilDomMounted()
const editor = monacoAgg.commands.getEditor()
```

## Build Process

1. `vite build` compiles to `dist/` in library mode (ES module format)
2. `vue-tsc` performs type checking and generates `.d.ts` files
3. `build-sync-file.mjs` copies README.md and LICENSE to dist/
4. Output: `dist/index.js` (ES module), `dist/index.umd.cjs` (UMD)

External dependencies (vue, monaco-editor) are not bundled.

## Type Definitions

Core shared types are in [lib/domain/define.ts](lib/domain/define.ts):
- `MessagesKey` - All i18n message keys
- `KeyName` - Normalized keyboard key names
- `BuiltInPage` - Special page identifiers
- `LeftSiderBarItem` - Sidebar panel types
- `ThemeMode` - Available themes ('dark' | 'light')
- `MessageType` - Message notification types

## Demo vs Library Code

- [src/](src/) - Demo application (not published)
- [lib/](lib/) - Published library code
