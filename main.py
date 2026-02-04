#!/usr/bin/env python3
"""Real-time eye tracking using OpenCV Haar cascades."""
from __future__ import annotations

import argparse
import collections
import time
from typing import Deque, Optional, Tuple

import cv2
import numpy as np


Point = Tuple[int, int]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Real-time eye tracking with OpenCV.")
    parser.add_argument("--camera", type=int, default=0, help="Camera index.")
    parser.add_argument("--scale", type=float, default=1.1, help="Haar cascade scale factor.")
    parser.add_argument("--neighbors", type=int, default=5, help="Haar cascade min neighbors.")
    parser.add_argument("--history", type=int, default=8, help="Number of points used for smoothing.")
    parser.add_argument("--flip", action="store_true", help="Mirror the frame horizontally.")
    parser.add_argument("--show-debug", action="store_true", help="Show debug overlays.")
    return parser.parse_args()


def load_cascades() -> tuple[cv2.CascadeClassifier, cv2.CascadeClassifier]:
    face_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    eye_path = cv2.data.haarcascades + "haarcascade_eye.xml"
    face_cascade = cv2.CascadeClassifier(face_path)
    eye_cascade = cv2.CascadeClassifier(eye_path)
    if face_cascade.empty() or eye_cascade.empty():
        raise RuntimeError("Unable to load Haar cascades. Check OpenCV installation.")
    return face_cascade, eye_cascade


def select_eye(eyes: np.ndarray) -> Optional[tuple[int, int, int, int]]:
    if len(eyes) == 0:
        return None
    return max(eyes, key=lambda rect: rect[2] * rect[3])


def center_of(rect: tuple[int, int, int, int], offset: Point = (0, 0)) -> Point:
    x, y, w, h = rect
    ox, oy = offset
    return (ox + x + w // 2, oy + y + h // 2)


def smooth_point(points: Deque[Point]) -> Optional[Point]:
    if not points:
        return None
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (int(sum(xs) / len(xs)), int(sum(ys) / len(ys)))


def draw_status(frame: np.ndarray, text: str, line: int = 0) -> None:
    cv2.putText(
        frame,
        text,
        (10, 20 + line * 22),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 0),
        2,
        cv2.LINE_AA,
    )


def main() -> None:
    args = parse_args()
    face_cascade, eye_cascade = load_cascades()

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        raise RuntimeError("Unable to open camera. Try a different --camera index.")

    history: Deque[Point] = collections.deque(maxlen=max(1, args.history))
    fps_timer = time.time()
    frame_count = 0
    fps = 0.0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                draw_status(frame, "Failed to read frame.")
                break

            if args.flip:
                frame = cv2.flip(frame, 1)

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=args.scale,
                minNeighbors=args.neighbors,
                minSize=(80, 80),
            )

            eye_center: Optional[Point] = None
            if len(faces) > 0:
                face = max(faces, key=lambda rect: rect[2] * rect[3])
                x, y, w, h = face
                face_roi_gray = gray[y : y + h, x : x + w]
                eyes = eye_cascade.detectMultiScale(
                    face_roi_gray,
                    scaleFactor=1.1,
                    minNeighbors=8,
                    minSize=(20, 20),
                )
                eye = select_eye(eyes)
                if eye is not None:
                    eye_center = center_of(eye, offset=(x, y))
                    history.append(eye_center)

                if args.show_debug:
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 255, 0), 2)
                    for ex, ey, ew, eh in eyes:
                        cv2.rectangle(
                            frame,
                            (x + ex, y + ey),
                            (x + ex + ew, y + ey + eh),
                            (255, 0, 255),
                            1,
                        )

            smoothed = smooth_point(history)
            if smoothed is not None:
                cv2.circle(frame, smoothed, 6, (0, 0, 255), -1)
                draw_status(frame, f"Eye center: {smoothed}")
            else:
                draw_status(frame, "Eye not detected")

            frame_count += 1
            if frame_count >= 10:
                now = time.time()
                fps = frame_count / (now - fps_timer)
                fps_timer = now
                frame_count = 0

            draw_status(frame, f"FPS: {fps:.1f}", line=1)

            cv2.imshow("Eye Tracker", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
