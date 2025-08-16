from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import keyboard  # low-level; works with games when run as Admin

KEY_HOLD_DEFAULT = 0.2  # seconds (adjust to taste)

app = Flask(__name__)
CORS(app)  # allow browser JS on the same machine to POST here

def send_key(ch: str, shift: bool, hold: float):
    if shift:
        keyboard.press("shift")
    keyboard.press(ch)
    time.sleep(hold)
    keyboard.release(ch)
    if shift:
        keyboard.release("shift")

@app.post("/press")
def press():
    data = request.get_json(force=True, silent=True) or {}
    ch    = (data.get("key") or "").strip().lower()
    shift = bool(data.get("shift"))
    hold  = float(data.get("hold") or KEY_HOLD_DEFAULT)

    if not ch:
        return jsonify(ok=False, error="missing key"), 400

    try:
        send_key(ch, shift, hold)
        return jsonify(ok=True)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

@app.post("/chord")
def chord():
    data = request.get_json(force=True, silent=True) or {}
    keys = data.get("keys") or []   # [{"key":"s","shift":False}, ...]
    hold = float(data.get("hold") or KEY_HOLD_DEFAULT)

    try:
        # Press all keys down (apply Shift per key so it doesn't affect others)
        for k in keys:
            key = (k.get("key") or "").strip().lower()
            sh  = bool(k.get("shift"))
            if not key: 
                continue
            if sh: keyboard.press("shift")
            keyboard.press(key)
            if sh: keyboard.release("shift")
        time.sleep(hold)
        # Release all keys
        for k in keys:
            key = (k.get("key") or "").strip().lower()
            if not key:
                continue
            keyboard.release(key)
        return jsonify(ok=True)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

if __name__ == "__main__":
    # Run: python keybridge_keyboard_only.py
    app.run(host="127.0.0.1", port=17643, debug=False)
