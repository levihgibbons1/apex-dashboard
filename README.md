# Apex Macro progress dashboard

A small public status page for Apex Macro. It shows progress in plain words only. No macro code lives here.

The page (`index.html`, `style.css`, `app.js`) reads everything from **`status.json`**. To update the dashboard, edit only `status.json` and commit it. GitHub Pages redeploys in about a minute, and open pages refresh themselves every minute.

## status.json fields

All times are ISO 8601 with an offset, for example `2026-11-11T11:20:00-08:00`. The page shows them in Pacific Time.

Every `status` is one of `done`, `doing`, or `todo`. Tests can also use `failed`.

| Field | What it is |
|---|---|
| `last_updated` | When this file was last refreshed. |
| `target` | `label` (for example `Tester build`) and `estimate` (for example `Sun Nov 15`), shown above the progress bar. |
| `scope_url` | Link to the full scope page for the next build. |
| `now.title` | The current task, shown big at the top. |
| `now.summary` | One or two plain sentences about what's happening. |
| `now.worker` | The worker's name, for example `apex-laptop`. |
| `now.worker_status` | `busy`, `online` (idle), or `offline`. |
| `now.started` | When the current task started. |
| `now.steps[]` | Steps under the current task at the top: `title`, `status`, `detail`. |
| `agents[]` | One card per agent. `name`, `role` (one plain line), `machine` (`Laptop` or `Main PC`), `status` (`busy`, `online` = idle, or `offline`), `doing` (plain words: what it's doing now), `branch` (`""` if none), `status_since` (when it entered that status), `last_finished` (latest finished work in plain words), `last_finished_at`, `last_finished_url` (`""` if none), `last_seen` (when it was last seen on Reason). |
| `checklist[]` | The tester-build checklist (currently 8 items). Each item has a stable `id`, plus `title`, `status`, and a one-line `detail`. The page computes the overall percent from this list: `done` counts as 1, `doing` (in progress) as 0.5, `todo` (not started) as 0. All items have equal weight. Do not put a percent in this file; only update item statuses and details. Stable ids: `paths-out`, `paths-back`, `hive-convert`, `patterns`, `speed-buffs`, `recovery`, `hook-ui`, `overnight-test`. |
| `later` | One line about what comes after the tester build. |
| `tests[]` | Latest test results: `name`, `status`, `result`. |
| `tests_note` | Where the test results come from. |
| `needs_you[]` | Things only Levi can do: `title`, `detail`. Use an empty list when there's nothing. |
| `prs[]` | Open pull requests: `number`, `title`, `status`, `commits`, `updated`, `url`. |
| `commits[]` | Recent saved changes, newest first: `when`, `title`, `url`. |


## How to update progress

Edit only `status.json`. For the tester build, change the matching `checklist` item's `status` and `detail`. Leave `id` and `title` alone unless the plan itself changes. The percent and the progress bar update themselves from those statuses.

Checklist `id` values and what they mean:

| id | Item |
|---|---|
| `paths-out` | Paths out to fields |
| `paths-back` | Paths back to the hive |
| `hive-convert` | Find your own hive slot and convert properly (Make Honey) |
| `patterns` | Natro's 12 gather patterns plus field defaults |
| `speed-buffs` | Speed and jump buffs (Haste, Bear Morph, and others) |
| `recovery` | Auto-rejoin and recovery (deaths, disconnects, freezes) |
| `hook-ui` | Hook your menu to the macro |
| `overnight-test` | 8-hour overnight test |

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
