# Apex Macro progress dashboard

A small public status page for Apex Macro. It shows progress in plain words only. No macro code lives here.

The page (`index.html`, `style.css`, `app.js`) reads everything from **`status.json`**. To update the dashboard, edit `status.json` (and the page files if the layout changes) and commit. GitHub Pages redeploys in about a minute, and open pages refresh themselves every minute.

## status.json fields

All times are ISO 8601 with an offset, for example `2026-11-11T21:31:00-08:00`. The page shows them in Pacific Time.

| Field | What it is |
|---|---|
| `last_updated` | When this file was last refreshed. |
| `goal.title` | The current goal, shown big at the top. |
| `goal.target` | Short deadline, for example `By morning Nov 12`. |
| `goal.tester` | Tester-build target, for example `Tester build Sun Nov 15`. |
| `goal.summary` | One or two plain sentences about where things stand. |
| `routes_note` | Where the route numbers come from. |
| `routes[]` | One row per field: `field`, `path_out` (for example `3/3`), `walk_home` (`5/5`), `loop` (full-loop status), `note`. Use `testing` when a number is not known. Never invent scores. Optional `path_out_status`, `walk_home_status`, and `loop_status` (`done`, `doing`, `failed`, `testing`) override the color when the text is not a fraction. |
| `building[]` | Work being built now: `title`, `detail`, optional `pr` and `url`. |
| `needs_you[]` | Things only Levi can do, or real blocks: `title`, `detail`. Use an empty list when there's nothing. |
| `done[]` | Recently finished work, newest first: `title`, `when`, `url`. |

Do not put worker names, machine status, or infra filler on the page unless it is briefly needed to explain a real block.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
