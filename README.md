# Eye-Tracker (Gaze + Cursor Control)

A real-time IPCV project that uses your eye movement to move the mouse cursor and supports blink-to-click.

## Features
- Real-time face/eye landmark tracking with MediaPipe Face Mesh.
- Cursor control using both iris centers (smoothed for stability).
- Blink detection using Eye Aspect Ratio (EAR) for mouse click actions.
- Dry-run mode for safe testing without moving your real cursor.
- Debug overlays for iris points, gaze point, EAR, and FPS.

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run
```bash
python main.py --camera 0 --flip --show-debug
```

### Safe first run (recommended)
```bash
python main.py --dry-run --flip --show-debug
```

## Controls
- Press `q` to quit.
- Blink naturally to trigger click (tune thresholds below if needed).

## Useful tuning flags
- `--margin 0.15` : keeps edge dead-zones so tiny eye jitter does not slam cursor to edges.
- `--history 6` : increases smoothing window (higher = smoother, slower).
- `--blink-threshold 0.20` : lower value makes blink click less sensitive.
- `--blink-frames 2` : consecutive frames below threshold needed to click.
- `--click-cooldown 0.6` : min seconds between generated clicks.

## Notes
- Good lighting and a stable camera improve performance a lot.
- If cursor is too sensitive, increase `--history` or `--margin`.
- If blink clicks are accidental, reduce `--blink-threshold` or increase `--blink-frames`.
