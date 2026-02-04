# Eye-Tracker

Real-time eye tracking IPCV demo using OpenCV Haar cascades.

## Features
- Detects face + both eyes in real time.
- Tracks left/right eye centers with simple smoothing.
- Optional debug overlays and mirrored camera feed.

## Setup
```bash
python -m venv .venv

pip install -r requirements.txt
```

## Run
```bash
python main.py --camera 0 --flip --show-debug
```
Press `q` to quit.

## Notes
- Lighting and camera placement affect detection quality.
- If detection is unstable, try adjusting `--scale` or `--neighbors`.
