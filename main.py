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


def select_eyes(eyes: np.ndarray, max_eyes: int = 2) -> list[tuple[int, int, int, int]]:
    if len(eyes) == 0:
        return []
    sorted_eyes = sorted(eyes, key=lambda rect: rect[2] * rect[3], reverse=True)
    return sorted_eyes[:max_eyes]


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

    history_left: Deque[Point] = collections.deque(maxlen=max(1, args.history))
    history_right: Deque[Point] = collections.deque(maxlen=max(1, args.history))
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

            left_center: Optional[Point] = None
            right_center: Optional[Point] = None
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
                selected_eyes = select_eyes(eyes)
                eye_centers = [center_of(eye, offset=(x, y)) for eye in selected_eyes]
                face_center_x = x + w // 2
                if len(eye_centers) == 2:
                    eye_centers.sort(key=lambda point: point[0])
                    left_center, right_center = eye_centers
                elif len(eye_centers) == 1:
                    only_eye = eye_centers[0]
                    if only_eye[0] < face_center_x:
                        left_center = only_eye
                    else:
                        right_center = only_eye

                if left_center is not None:
                    history_left.append(left_center)
                if right_center is not None:
                    history_right.append(right_center)

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

            smoothed_left = smooth_point(history_left)
            smoothed_right = smooth_point(history_right)
            status_line = 0
            if smoothed_left is not None:
                cv2.circle(frame, smoothed_left, 6, (0, 0, 255), -1)
                draw_status(frame, f"Left eye: {smoothed_left}", line=status_line)
                status_line += 1
            if smoothed_right is not None:
                cv2.circle(frame, smoothed_right, 6, (255, 0, 0), -1)
                draw_status(frame, f"Right eye: {smoothed_right}", line=status_line)
                status_line += 1
            if smoothed_left is None and smoothed_right is None:
                draw_status(frame, "Eyes not detected", line=status_line)
                status_line += 1

            frame_count += 1
            if frame_count >= 10:
                now = time.time()
                fps = frame_count / (now - fps_timer)
                fps_timer = now
                frame_count = 0

            draw_status(frame, f"FPS: {fps:.1f}", line=status_line)

            cv2.imshow("Eye Tracker", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
