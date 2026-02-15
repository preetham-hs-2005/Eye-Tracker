#!/usr/bin/env python3
"""Real-time gaze-controlled cursor with blink click support."""
from __future__ import annotations

import argparse
import collections
import time
from typing import Deque, Iterable, Optional, Tuple

import cv2
import mediapipe as mp
import numpy as np
import pyautogui


Point = Tuple[float, float]

LEFT_EYE = {"left": 33, "right": 133, "top": 159, "bottom": 145}
RIGHT_EYE = {"left": 362, "right": 263, "top": 386, "bottom": 374}
LEFT_IRIS = [468, 469, 470, 471, 472]
RIGHT_IRIS = [473, 474, 475, 476, 477]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Eye-controlled cursor using MediaPipe Face Mesh.")
    parser.add_argument("--camera", type=int, default=0, help="Camera index.")
    parser.add_argument("--flip", action="store_true", help="Mirror the frame horizontally.")
    parser.add_argument("--history", type=int, default=6, help="Smoothing history for cursor points.")
    parser.add_argument("--margin", type=float, default=0.15, help="Dead margin from each edge (0-0.4).")
    parser.add_argument("--blink-threshold", type=float, default=0.20, help="EAR threshold to detect blink.")
    parser.add_argument("--blink-frames", type=int, default=2, help="Consecutive low-EAR frames for click.")
    parser.add_argument("--click-cooldown", type=float, default=0.6, help="Seconds between clicks.")
    parser.add_argument("--show-debug", action="store_true", help="Show landmarks and tracking overlays.")
    parser.add_argument("--dry-run", action="store_true", help="Do not move/click cursor, only visualize.")
    return parser.parse_args()


def landmark_to_pixel(landmark, width: int, height: int) -> Point:
    return landmark.x * width, landmark.y * height


def eye_aspect_ratio(landmarks, eye_idx: dict[str, int], width: int, height: int) -> float:
    left = np.array(landmark_to_pixel(landmarks[eye_idx["left"]], width, height))
    right = np.array(landmark_to_pixel(landmarks[eye_idx["right"]], width, height))
    top = np.array(landmark_to_pixel(landmarks[eye_idx["top"]], width, height))
    bottom = np.array(landmark_to_pixel(landmarks[eye_idx["bottom"]], width, height))
    vertical = np.linalg.norm(top - bottom)
    horizontal = np.linalg.norm(left - right)
    if horizontal == 0:
        return 0.0
    return float(vertical / horizontal)


def iris_center(landmarks, iris_idx: Iterable[int], width: int, height: int) -> Point:
    points = np.array([landmark_to_pixel(landmarks[i], width, height) for i in iris_idx], dtype=np.float32)
    center = points.mean(axis=0)
    return float(center[0]), float(center[1])


def smooth_point(points: Deque[Point]) -> Optional[Point]:
    if not points:
        return None
    arr = np.array(points, dtype=np.float32)
    mean = arr.mean(axis=0)
    return float(mean[0]), float(mean[1])


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def map_to_screen(norm_x: float, norm_y: float, screen_w: int, screen_h: int, margin: float) -> Point:
    margin = max(0.0, min(0.4, margin))
    usable = 1.0 - 2.0 * margin
    if usable <= 0:
        usable = 0.2
    x = clamp01((norm_x - margin) / usable)
    y = clamp01((norm_y - margin) / usable)
    return x * screen_w, y * screen_h


def draw_status(frame, text: str, line: int) -> None:
    cv2.putText(
        frame,
        text,
        (10, 24 + line * 24),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 0),
        2,
        cv2.LINE_AA,
    )


def main() -> None:
    args = parse_args()
    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        raise RuntimeError("Unable to open camera. Try a different --camera index.")

    pyautogui.FAILSAFE = False
    screen_w, screen_h = pyautogui.size()

    history: Deque[Point] = collections.deque(maxlen=max(1, args.history))
    blink_frames = 0
    last_click = 0.0

    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    fps_timer = time.time()
    frame_counter = 0
    fps = 0.0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if args.flip:
                frame = cv2.flip(frame, 1)

            height, width = frame.shape[:2]
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = face_mesh.process(rgb)

            status_line = 0
            if result.multi_face_landmarks:
                landmarks = result.multi_face_landmarks[0].landmark

                left_iris = iris_center(landmarks, LEFT_IRIS, width, height)
                right_iris = iris_center(landmarks, RIGHT_IRIS, width, height)
                gaze = ((left_iris[0] + right_iris[0]) / 2.0, (left_iris[1] + right_iris[1]) / 2.0)

                history.append(gaze)
                smoothed = smooth_point(history)

                if smoothed is not None:
                    norm_x = smoothed[0] / width
                    norm_y = smoothed[1] / height
                    cursor_x, cursor_y = map_to_screen(norm_x, norm_y, screen_w, screen_h, args.margin)

                    if not args.dry_run:
                        pyautogui.moveTo(cursor_x, cursor_y, _pause=False)

                    draw_status(frame, f"Cursor: ({int(cursor_x)}, {int(cursor_y)})", status_line)
                    status_line += 1

                left_ear = eye_aspect_ratio(landmarks, LEFT_EYE, width, height)
                right_ear = eye_aspect_ratio(landmarks, RIGHT_EYE, width, height)
                ear = (left_ear + right_ear) / 2.0

                if ear < args.blink_threshold:
                    blink_frames += 1
                else:
                    blink_frames = 0

                now = time.time()
                if blink_frames >= args.blink_frames and now - last_click >= args.click_cooldown:
                    if not args.dry_run:
                        pyautogui.click()
                    last_click = now
                    blink_frames = 0
                    draw_status(frame, "Click triggered", status_line)
                    status_line += 1

                draw_status(frame, f"EAR: {ear:.3f}", status_line)
                status_line += 1

                if args.show_debug:
                    cv2.circle(frame, (int(left_iris[0]), int(left_iris[1])), 4, (255, 0, 0), -1)
                    cv2.circle(frame, (int(right_iris[0]), int(right_iris[1])), 4, (0, 0, 255), -1)
                    cv2.circle(frame, (int(gaze[0]), int(gaze[1])), 5, (0, 255, 255), -1)
            else:
                blink_frames = 0
                draw_status(frame, "Face not detected", status_line)
                status_line += 1

            frame_counter += 1
            if frame_counter >= 10:
                now = time.time()
                fps = frame_counter / max(now - fps_timer, 1e-6)
                fps_timer = now
                frame_counter = 0

            draw_status(frame, f"FPS: {fps:.1f}", status_line)
            status_line += 1
            draw_status(frame, "Press q to quit", status_line)

            cv2.imshow("Gaze Cursor Control", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        face_mesh.close()
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
