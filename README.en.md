# Project Activity Log

**English** | [日本語](./README.md)

> The Japanese README is the primary, most up-to-date version. This page is a summary.

A desktop app that records the time you spend on multiple projects and shows your monthly utilization.

Set a monthly base number of hours and an allocation (%) for each project. The app then shows actual vs. target hours and the daily pace you need for the rest of the month.
All data stays on your machine and is never sent anywhere.

## Quick Start

```bash
git clone https://github.com/miuradaiki/project-activity-log.git
cd project-activity-log
npm install
npm run electron:dev
```

**Requirements**: Node.js 18 or later

## Screens

- **Today** (`Ctrl+1`): Start and stop the timer, see today's hours, monthly progress, required daily pace and a timeline. Add past entries manually and search, edit or delete your history. The timer keeps running through system sleep and stops automatically after 8 hours
- **Projects** (`Ctrl+2`): Create projects, set monthly allocations, and track progress. Filter by status, sort, search and archive. Projects with 0% allocation are "tracking only"
- **Reports** (`Ctrl+3`): Monthly utilization summary, weekday hours by week, and per-project results. Browse previous months
- **Settings** (`Ctrl+,`): Monthly base hours (80–200), theme, language (Japanese / English) and CSV import

## Keyboard Shortcuts

`Ctrl` (⌃) is used on macOS as well.

| Action             | Shortcut               |
| ------------------ | ---------------------- |
| Today              | `Ctrl+1`               |
| Projects           | `Ctrl+2`               |
| Reports            | `Ctrl+3`               |
| Settings           | `Ctrl+,`               |
| New project        | `Ctrl+N`               |
| Start / stop timer | `Space` (Today screen) |
| Toggle theme       | `Alt+L` (macOS: `⌥L`)  |
| Shortcut list      | `Ctrl+/` or `Ctrl+H`   |

## Data

Data is stored as JSON in Electron's userData directory (`data/projects.json`, `data/timeEntries.json`, `settings.json`, `backups/`).

CSV import creates a backup first and restores it if the import fails:

```csv
date,start_time,end_time,duration_minutes,project_name,project_description,notes
2025/2/3,10:35:42,11:28:19,53,Project Name,Description,Notes
```

## Development

```bash
npm run electron:dev      # Development
npm run electron:build    # Distributable build (output: release/)
npm test                  # Unit tests (Jest)
npm run test:e2e          # E2E tests (Playwright)
npm run lint              # ESLint
```

Tech stack: Electron 40, React 19, TypeScript 5, MUI 7, Recharts 2, Vite 5, Jest 30, Playwright.
See [CLAUDE.md](./CLAUDE.md) for architecture details.

## License

MIT License
