# Project Activity Log

A desktop application for tracking and analyzing work time across multiple projects.

Set monthly work allocation and visualize progress per project. Efficiently manage daily work with timer functionality and dashboards.

## Quick Start

```bash
# Installation
git clone https://github.com/daikimiura/project-activity-log.git
cd project-activity-log
npm install

# Launch
npm run electron:dev
```

**Requirements**: Node.js v16 or higher

## Screens

The app consists of 4 screens. Switch between them using the sidebar or keyboard shortcuts.

### Timer Screen (`Ctrl+3`)

The main screen for recording work time.

- **Timer**: Select a project and start. Continues tracking during system sleep, auto-stops after 8 hours
- **Manual Entry**: Add past work time with date and time specification
- **History**: View, edit, and delete work records in timeline or list format

### Dashboard Screen (`Ctrl+1`)

Analyze and visualize work data.

- **Daily**: Today's work time and active projects
- **Weekly**: Daily work time trends, time distribution by project
- **Monthly**: Weekly work time trends, monthly summary
- **Activity Calendar**: GitHub-style heatmap

### Projects Screen (`Ctrl+2`)

Create and manage projects, track progress.

- **Allocation**: Set monthly work allocation for each project (e.g., 40% for Project A, 60% for B)
- **Progress Tracking**: Display actual vs target hours with progress bars. Warning at 90%, exceeded warning at 100%+
- **Filter & Sort**: Filter by status, sort by name, progress rate, or remaining time
- **Archive**: Hide completed projects

### Settings Screen (`Ctrl+,`)

- **Monthly Base Hours**: Set between 80-200 hours. Multiplied by each project's allocation to calculate monthly target hours
- **Appearance**: Toggle dark mode (`Alt+L`)

## Keyboard Shortcuts

| Action           | Shortcut               |
| ---------------- | ---------------------- |
| Dashboard        | `Ctrl+1`               |
| Projects         | `Ctrl+2`               |
| Timer            | `Ctrl+3`               |
| Settings         | `Ctrl+,`               |
| New Project      | `Ctrl+N`               |
| Start/Stop Timer | `Space` (Timer screen) |
| Stop Timer       | `Escape`               |
| Toggle Theme     | `Alt+L`                |
| Shortcuts List   | `Ctrl+H` or `Ctrl+/`   |

## Data

All data is stored locally. No data is sent to external servers.

```
[userData]/
├── data/
│   ├── projects.json      # Project information
│   └── timeEntries.json   # Time entries
├── settings.json          # App settings
└── backups/               # Automatic backups
```

**CSV Import**: Supports migration from other tools. Creates automatic backup before import and auto-restores on failure.

```csv
date,start_time,end_time,duration_minutes,project_name,project_description,notes
2025/2/3,10:35:42,11:28:19,53,Project Name,Description,Notes
```

## Development

### Commands

```bash
npm run electron:dev      # Start development environment
npm run electron:build    # Production build
npm test                  # Unit tests
npm run test:e2e          # E2E tests (Playwright)
npm run lint              # ESLint
npm run format            # Prettier
```

### Tech Stack

| Category  | Technology                          |
| --------- | ----------------------------------- |
| Framework | Electron 29, React 18, TypeScript 5 |
| UI        | Material-UI 5, Framer Motion 12     |
| Charts    | Recharts 2                          |
| Build     | Vite 5                              |
| Testing   | Jest 30, Playwright                 |

### Architecture

Uses standard Electron architecture. The main process handles file I/O and communicates with the renderer process (React) via IPC.

See [CLAUDE.md](./CLAUDE.md) for details.

## License

MIT License
