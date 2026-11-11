# Apex Macro progress dashboard

A small public status page for Apex Macro. It shows progress in plain words only. No macro code lives here.

The page (`index.html`, `style.css`, `app.js`) reads everything from **`status.json`**. To update the dashboard, edit only `status.json` and commit it. GitHub Pages redeploys in about a minute, and open pages refresh themselves every minute.

## status.json fields

All times are ISO 8601 with an offset, for example `2026-11-11T11:20:00-08:00`. The page shows them in Pacific Time.

Every `status` is one of `done`, `doing`, or `todo`. Tests can also use `failed`.

| Field | What it is |
|---|---|
| `last_updated` | When this file was last refreshed. |
| `target` | `label` and `estimate` for the next build, shown above the roadmap. |
| `scope_url` | Link to the full scope page for the next build. |
| `now.title` | The current task, shown big at the top. |
| `now.summary` | One or two plain sentences about what's happening. |
| `now.worker` | The worker's name, for example `apex-laptop`. |
| `now.worker_status` | `busy`, `online` (idle), or `offline`. |
| `now.started` | When the current task started. |
| `now.steps[]` | The checklist: `title`, `status`, `detail`. |
| `agents[]` | One card per agent. `name`, `role` (one plain line), `machine` (`Laptop` or `Main PC`), `status` (`busy`, `online` = idle, or `offline`), `doing` (plain words: what it's doing now), `branch` (`""` if none), `status_since` (when it entered that status), `last_finished` (latest finished work in plain words), `last_finished_at`, `last_finished_url` (`""` if none), `last_seen` (when it was last seen on Reason). |
| `stages[]` | The stages to the next build (any number): `title`, `short` (bar label), `status`, `detail`. |
| `later` | One line about what comes after the tester build. |
| `tests[]` | Latest test results: `name`, `status`, `result`. |
| `tests_note` | Where the test results come from. |
| `needs_you[]` | Things only Levi can do: `title`, `detail`. Use an empty list when there's nothing. |
| `prs[]` | Open pull requests: `number`, `title`, `status`, `commits`, `updated`, `url`. |
| `commits[]` | Recent saved changes, newest first: `when`, `title`, `url`. |

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
