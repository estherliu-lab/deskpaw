# DeskPaw Desktop Pet

This folder reserves the desktop companion track for future DeskPaw versions.

## Recommended Path

Tauri is the preferred first choice because it can keep the app small and can wrap the existing web UI. Electron remains a practical fallback if richer desktop APIs or ecosystem packages become necessary.

## Target Capabilities

- Transparent background
- Borderless window
- Draggable pet
- Always-on-top mode
- Tray menu
- Click to switch actions
- Bubble reminders
- Focus timer
- Water reminders

## V1 Status

The runnable product is currently the Web PWA in the project root. The desktop app is intentionally documented first so the GitHub project has a clear expansion path without shipping a half-built native shell.

## Suggested Tauri Plan

1. Create `src-tauri/` and wrap the built Vite app.
2. Configure transparent, decorations-free windows.
3. Add drag regions and always-on-top toggles.
4. Persist pet profile data through a local app data store.
5. Add tray actions for focus, water reminder, hide/show, and quit.
