# EUC Patching App

Internal tool for the EUC team's monthly Windows patching. The current scope is:

- An issue-reporting form that employees use to report patch-related problems
- A dashboard for viewing reported issues

Integrations (Intune, Entra, Microsoft Graph), sign-in and email are out of scope for now.

## Project layout

```
client/   React + TypeScript app (Vite)
server/   Backend API (not created yet)
```

## Getting started

Requires Node.js 24 or later.

```
cd client
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts (run inside `client/`)

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Starts the dev server with live reload    |
| `npm run build`  | Type-checks and builds for production     |
| `npm run lint`   | Checks code for likely bugs (Oxlint)      |
| `npm run format` | Formats code with Prettier                |

## Working together

- Don't commit directly to `main`. Create a branch per change, for example `feature/issue-form`.
- Open a pull request and have the other developer review it before merging.
- Run `npm run lint` and `npm run build` before opening a pull request.
