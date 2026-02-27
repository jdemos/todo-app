# Copilot Instructions

## Architecture

This is a vanilla JavaScript single-page todo application with no build tools, frameworks, or dependencies. It consists of three files:

- `index.html` — Static markup with a three-panel CSS Grid layout (sidebar, task list, detail panel)
- `app.js` — All application logic: state management, rendering, and event handling
- `style.css` — Styling with CSS custom properties for light/dark theming via `[data-theme="dark"]`

There is no bundler, transpiler, or package manager. Open `index.html` directly in a browser to run.

## State Management

All app state lives in a single `state` object persisted to `localStorage` under the key `todo-app-state`. The pattern is:

1. Mutate `state` directly
2. Call `save()` to persist to localStorage
3. Call `render()` to re-render the entire UI

There is no partial/incremental rendering — `render()` rebuilds the sidebar, task list, and detail panel every time.

## Key Conventions

- **IDs** are generated via `uid()` which combines `Date.now().toString(36)` with a random suffix.
- **Dates** are stored as ISO date strings (`YYYY-MM-DD`) and displayed in `DD-MM-YY` format.
- **Colors** for lists and tags are assigned from fixed arrays (`LIST_COLORS`, `TAG_COLORS`) by index.
- **DOM construction** uses `document.createElement` in render functions but innerHTML templates in `renderDetail()`.
- **User input** for adding tasks, lists, tags, and subtasks uses `prompt()` dialogs.
- **Theme** preference is stored separately in localStorage under the key `theme`.
