# roblox-virtualpiano-macro

Make VirtualPiano’s **Autoplay** drive Roblox by mirroring keys from the web page to your PC and injecting them into Roblox.

---

## Demo song

- https://virtualpiano.net/?song-post-32805

---

## How it works

- A **watcher script** (`watcher.js`) runs on virtualpiano.net and watches `#song-pattern`.
  - When a `<span>` turns `.active`, it sends that key (and **Shift** if uppercase) to the local bridge.
  - Supports chords via `<span class="chord">…</span>` (presses keys together).
  - Auto-closes the site’s 60s **idle** popup.
- A **Python bridge** (`emulateKey.py`) receives keys and presses them using the `keyboard` library.
  - Run as **Administrator** so games accept the input.

---

## Requirements

- **Windows** (Roblox client)
- **Python 3.8+**
- Packages:
  
  ```bash
  pip install flask flask-cors keyboard psutil pywin32
  ```
  
- Run `emulateKey.py` **as Administrator**.

---

## Quick start

1. **Open** the song page on virtualpiano.net (e.g., the demo link above).
2. **Paste** the contents of **`watcher.js`** into the browser DevTools **Console** and press Enter.
3. **Run** the Python bridge:
  
  ```bash
  python emulateKey.py
  ```
  
4. Click **Autoplay** on the site, then **switch to Roblox** so it’s focused.

> Tip: If you added the optional `/focus` endpoint + Autoplay hook, Roblox will auto-focus when you click **Autoplay**.

---

## Files

- `watcher.js`
  - Watches `#song-pattern` for `.active` spans.
  - Sends single notes to `POST /press` and chords to `POST /chord` at `http://127.0.0.1:17643`.
  - Skips `<span class="pause">`, supports `<span class="chord">ID</span>`.
  - Maps uppercase letters to `Shift+letter` automatically.
- `emulateKey.py`
  - Flask server with `/press` and `/chord`.
  - Uses `keyboard` to inject keys (no `pyautogui`).
  - Default hold time: `0.2s` (adjustable).

---

## Options & tweaks

- **Hold time** (how long keys are held):
  - In `watcher.js`: change `HOLD_MS`
  - In Python: change `KEY_HOLD_DEFAULT`
- **Auto-focus Roblox** (optional):
  - Add a `/focus` endpoint in Python and call it from JS when **Autoplay** is clicked.
- **Roblox-only gate** (optional):
  - Gate sending so only the Roblox foreground window receives keys (ignore other apps).

---

## Troubleshooting

- Keys type in **chat** but not the piano → click the game viewport (defocus chat) or press `Esc`.
- Nothing happens → run Python as **Administrator**; some games ignore non-admin injection.
- Missed notes → increase hold to **160–200 ms**.
- Wrong layout → add a mapping in `watcher.js` before sending (map VP letters to your game’s keys).

---

## Notes

- Use responsibly; automated input may violate a game’s ToS.
- For educational purposes only.

---

## License

MIT (or your preferred license).