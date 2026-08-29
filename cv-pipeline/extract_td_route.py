#!/usr/bin/env python3
"""
Extract TD route coordinates from CV tracking JSON files.

Usage:
  python extract_td_route.py               # process all td-route-manual-input/*.json
  python extract_td_route.py --force       # overwrite existing outputs
  python extract_td_route.py --input FILE  # process a single config file
"""
import json
import sys
import argparse
import pathlib

try:
    import numpy as np
    import cv2
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False

SCRIPT_DIR = pathlib.Path(__file__).parent
INPUT_DIR = SCRIPT_DIR / 'td-route-manual-input'
TRACKING_DIR = SCRIPT_DIR / 'tracking_output'
OUTPUT_DIR = SCRIPT_DIR.parent / 'src' / 'data' / 'touchdownRoutes'

FIELD_LENGTH_WITH_EZ = 120.0
FIELD_LENGTH_WITHOUT_EZ = 100.0
FIELD_WIDTH = 53.333


def compute_homography(field_polygon, field_length):
    """pixel → yard homography (좌상→우상→우하→좌하 순서 가정)"""
    src = np.array(field_polygon, dtype=np.float32)
    dst = np.array([
        [0, 0],
        [field_length, 0],
        [field_length, FIELD_WIDTH],
        [0, FIELD_WIDTH],
    ], dtype=np.float32)
    return cv2.getPerspectiveTransform(src, dst)


def transform_point(H, px, py):
    pt = np.array([[[float(px), float(py)]]], dtype=np.float32)
    out = cv2.perspectiveTransform(pt, H)
    return float(out[0][0][0]), float(out[0][0][1])


def smooth(points, window=3):
    """단순 이동평균 스무딩 (window=3)"""
    if len(points) < window:
        return points
    result = []
    half = window // 2
    for i in range(len(points)):
        lo = max(0, i - half)
        hi = min(len(points), i + half + 1)
        chunk = points[lo:hi]
        result.append({
            'x': round(sum(p['x'] for p in chunk) / len(chunk), 2),
            'y': round(sum(p['y'] for p in chunk) / len(chunk), 2),
        })
    return result


def collect_points(frames_list, track_id, frame_start, frame_end, H):
    """지정 track_id의 feet 좌표를 frameRange 안에서 수집 → 야드 좌표로 변환"""
    pts = []
    for frame_obj in frames_list:
        fid = frame_obj.get('frame_id', 0)
        if fid < frame_start or fid > frame_end:
            continue
        for player in frame_obj.get('players', []):
            if player.get('track_id') != track_id:
                continue
            feet = player.get('feet')
            if feet is None:
                bbox = player.get('bbox')
                if bbox and len(bbox) == 4:
                    feet = [(bbox[0] + bbox[2]) / 2, bbox[3]]
                else:
                    continue
            x, y = transform_point(H, feet[0], feet[1])
            pts.append({'x': x, 'y': y})
    return pts


def out_of_range_ratio(pts, field_length):
    if not pts:
        return 1.0
    oob = sum(1 for p in pts if p['x'] < -5 or p['x'] > field_length + 5
              or p['y'] < -5 or p['y'] > FIELD_WIDTH + 5)
    return oob / len(pts)


def extract_route(config, force=False):
    game_key = config['gameKey']
    clip_key = str(config['clipKey'])
    out_path = OUTPUT_DIR / f'{game_key}__{clip_key}.json'

    if out_path.exists() and not force:
        print(f'  [SKIP] {out_path.name} 이미 존재 (--force로 덮어쓰기)')
        return True

    tracking_path = TRACKING_DIR / config['trackingJsonFile']
    if not tracking_path.exists():
        print(f'  [ERROR] 트래킹 파일 없음: {tracking_path}')
        return False

    with open(tracking_path, encoding='utf-8') as f:
        tracking = json.load(f)

    field_polygon = tracking.get('field_polygon')
    if not field_polygon or len(field_polygon) != 4:
        print(f'  [ERROR] field_polygon 이상: {tracking_path.name}')
        return False

    frames_list = tracking.get('frames', [])
    frame_start, frame_end = config['frameRange']
    scorer_id = config['scorerTrackId']
    passer_id = config.get('passerTrackId')

    # 120야드 호모그래피 먼저 시도
    H = compute_homography(field_polygon, FIELD_LENGTH_WITH_EZ)
    field_length = FIELD_LENGTH_WITH_EZ

    scorer_pts = collect_points(frames_list, scorer_id, frame_start, frame_end, H)

    # 30% 이상 범위 이탈 시 100야드로 재시도
    if scorer_pts and out_of_range_ratio(scorer_pts, field_length) > 0.3:
        print(f'  [WARN] 120야드 기준 이탈 비율 높음 → 100야드로 재시도')
        H = compute_homography(field_polygon, FIELD_LENGTH_WITHOUT_EZ)
        field_length = FIELD_LENGTH_WITHOUT_EZ
        scorer_pts = collect_points(frames_list, scorer_id, frame_start, frame_end, H)

    if len(scorer_pts) < 3:
        print(f'  [FAIL] 득점 선수 좌표 부족 ({len(scorer_pts)}개) — 최소 3개 필요')
        return False

    passer_pts = []
    if passer_id:
        passer_pts = collect_points(frames_list, passer_id, frame_start, frame_end, H)

    # ownGoalEnd 정규화: top_right면 x축 반전
    if config.get('ownGoalEnd') == 'top_right':
        scorer_pts = [{'x': round(field_length - p['x'], 2), 'y': p['y']} for p in scorer_pts]
        passer_pts = [{'x': round(field_length - p['x'], 2), 'y': p['y']} for p in passer_pts]

    scorer_pts = smooth(scorer_pts, window=3)
    if passer_pts:
        passer_pts = smooth(passer_pts, window=3)

    result = {
        'gameKey': game_key,
        'clipKey': clip_key,
        'scorer': {
            'trackId': scorer_id,
            'jerseyNumber': config.get('scorerJerseyNumber'),
        },
        'passer': {
            'trackId': passer_id,
            'jerseyNumber': config.get('passerJerseyNumber'),
        } if passer_id else None,
        'points': scorer_pts,
        'passerPoints': passer_pts if passer_pts else None,
        'frameRange': config['frameRange'],
        'fieldLength': field_length,
        'unit': 'yards',
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f'  [OK] {out_path.name} 저장 ({len(scorer_pts)}개 좌표)')
    return True


def main():
    parser = argparse.ArgumentParser(description='CV 트래킹 데이터에서 TD 경로 추출')
    parser.add_argument('--force', action='store_true', help='기존 출력 파일 덮어쓰기')
    parser.add_argument('--input', type=str, default=None, help='특정 입력 JSON 파일만 처리')
    args = parser.parse_args()

    if not HAS_DEPS:
        print('ERROR: 의존성 미설치. 다음 명령 실행:\n  pip install -r requirements.txt')
        sys.exit(1)

    if args.input:
        input_files = [pathlib.Path(args.input)]
    else:
        input_files = sorted(INPUT_DIR.glob('*.json'))

    if not input_files:
        print(f'처리할 파일 없음: {INPUT_DIR}')
        sys.exit(0)

    ok = 0
    failed = 0
    for path in input_files:
        if path.suffix != '.json':
            continue
        print(f'처리 중: {path.name}')
        with open(path, encoding='utf-8') as f:
            config = json.load(f)
        if extract_route(config, force=args.force):
            ok += 1
        else:
            failed += 1

    print(f'\n완료: {ok}개 성공, {failed}개 실패/스킵')


if __name__ == '__main__':
    main()
