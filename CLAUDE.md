# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Start development environment (recommended)
npm run electron:dev

# Alternative: Run Vite and Electron separately
npm run dev    # Terminal 1: Vite dev server
npm run start  # Terminal 2: Electron app
```

### Build

```bash
# Build production distributable
npm run electron:build

# Build web assets only
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

Testing stack: Jest + React Testing Library

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

Pre-commit hooks are configured via Husky + lint-staged to automatically lint and format staged files.

## Architecture Overview

### Tech Stack

- **Electron 29.0**: Cross-platform desktop application
- **React 18.2 + TypeScript**: UI framework with strict type checking
- **Material-UI (MUI) 5.11**: Component library
- **Vite 5.0**: Build tool
- **Recharts 2.15.1**: Data visualization
- **State Management**: React Context API (no Redux/Zustand)

### Electron Architecture

The app follows standard Electron architecture with secure IPC communication:

1. **Main Process** (`main.js`):
   - Manages application lifecycle and windows
   - Handles file system operations via `storageUtils.js`
   - Provides IPC endpoints for data persistence
   - Manages system tray functionality

2. **Preload Script** (`preload.js`):
   - Exposes safe APIs to renderer process
   - Bridges main/renderer communication
   - Implements `window.electronAPI` interface

3. **Renderer Process** (React app):
   - All UI rendering and user interactions
   - Communicates with main process via `window.electronAPI`

### Key Architectural Patterns

1. **Data Persistence**:
   - All data stored as JSON files in Electron's userData directory
   - Projects: `data/projects.json`
   - Time entries: `data/timeEntries.json`
   - Settings: `settings.json`
   - Automatic backup system before data modifications

2. **Context-based State Management**:
   - `SettingsContext`: Global app settings (monthly base hours)
   - `LanguageContext`: i18n support
   - No global state library - components manage local state

3. **Component Structure**:

   ```
   components/
   ├── dashboard/     # Analytics views (daily/weekly/monthly)
   ├── timer/         # Timer functionality
   ├── ui/
   │   ├── layout/    # App layout (Sidebar, Layout)
   │   ├── project/   # Project CRUD components
   │   └── global/    # Global timer component
   ├── settings/      # Settings management
   └── comparison/    # Project comparison features
   ```

4. **Custom Hooks**:
   - `useStorage`: Handles data persistence via Electron IPC
   - `useSettings`: Settings management
   - `useTimer`: Timer functionality with sleep detection

5. **Type Safety**:
   - TypeScript with strict mode enabled
   - All data models defined in `types/` directory
   - Electron API types in `types/electron.d.ts`

## Important Implementation Details

### Timer System

- Continues tracking time during system sleep
- Auto-stops after 8 hours with desktop notification
- Persists state across app restarts

### Project Progress Management

- Monthly base hours customizable (80-200 hours)
- Project allocation by percentage (0-100%)
- Visual warnings at 90% and 100% completion
- Real-time progress tracking

### Data Import

- CSV import with automatic backup
- Creates new projects if not found
- Rollback on import failure

### i18n Support

- Japanese as primary language
- Translation system in place via `i18n/` directory

## Development Considerations

### Working with Electron IPC

All data operations must go through the preload bridge:

```typescript
// Good
await window.electronAPI.saveProjects(projects);

// Bad - No direct fs access in renderer
fs.writeFileSync(...); // Will fail
```

### State Updates

Components handle their own state - no centralized store. When updating shared data:

1. Update via `useStorage` hook
2. Component re-renders automatically
3. Other components poll or listen for changes

### File Paths

Always use Electron's app paths - never hardcode:

```javascript
// In main process only
app.getPath('userData');
```

### TypeScript Strict Mode

The project enforces strict TypeScript. Always:

- Define explicit types for function parameters
- Handle null/undefined cases
- Use type guards when necessary

### Code Comments

Only include comments that provide valuable context:

- **Do include**: Complex business logic explanations, non-obvious edge cases, security considerations, performance notes
- **Don't include**: Obvious statements like "// より控えめな移動" or "// 中央寄せに変更"
- Focus on WHY the code does something, not WHAT it does
- Avoid redundant comments that duplicate what the code clearly shows

### Documentation Guidelines

When generating documentation or any content:

- Use the actual current date from the environment, not knowledge cutoff dates
- **NEVER include time estimates or development duration**
- Focus on technical facts and implementation details only

### Markdown Formatting

When creating or editing markdown files:

- **ALWAYS end files with a single newline character**
- Remove trailing whitespace from line endings
- Follow markdownlint standards for consistent formatting
