# Second Brain

A small Vite + React project plus a collection of Python utilities for analyzing and transforming JSX/HTML-like text (brace/tag checks, extraction, tracing, and fixes).

**Key points:**
- **React app:** Located under `src/` and built with Vite.
- **Utilities:** A set of Python scripts in `scratch/` for parsing, tracing, and fixing markup/handler issues.

## Features

- Fast development server with Vite
- Ready-to-run Python tooling for code analysis and automated fixes
- ESLint configuration included for code quality

## Prerequisites

- Node.js (recommended >= 18)
- npm or yarn
- Python 3.8+ (for scripts in `scratch/`)

## Install

Install Node dependencies:

```
npm install
```

Install Python dependencies if any (virtualenv recommended):

```
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt  # if you add a requirements file
```

## Available Scripts

The project exposes the following npm scripts (from `package.json`):

- `dev`: Starts the Vite development server.
- `build`: Builds the production bundle with Vite.
- `preview`: Locally preview the production build.
- `lint`: Run ESLint on the repository.

Common commands:

```
npm run dev
npm run build
npm run preview
npm run lint
```

## Project Structure

- `src/` — React source files (App.jsx, main.jsx, styles, assets).
- `public/` — Static assets served by Vite.
- `scratch/` — Python scripts for brace/tag analysis and utilities. Examples:
	- `check_tags.py`, `trace_brackets.py`, `restore_and_fix.py`, etc.
- `package.json`, `vite.config.js`, `eslint.config.js` — project configuration.

## Running the App

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open your browser at the address printed by Vite (usually `http://localhost:5173`).

## Using the Python utilities

The `scratch/` folder contains many small scripts intended for interactive use. Run them with Python, for example:

```
python scratch/check_tags.py <path-to-file>
```

Read the top of each script for usage notes.

## Contributing

Contributions welcome. Suggested workflow:

1. Fork or branch the repo
2. Add tests or verify behavior locally
3. Submit a pull request with a clear description

## License

This project currently has no license file. Add a `LICENSE` if you want to make terms explicit.

---

If you'd like, I can also:

- Add a `requirements.txt` for the Python tools
- Add a small example or screenshot for the React app
- Add CI steps for linting and build

Let me know which of those you'd like next.
