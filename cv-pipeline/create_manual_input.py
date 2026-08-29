#!/usr/bin/env python3
"""
Interactive CLI to create td-route-manual-input/*.json files.
Usage: python create_manual_input.py
"""
import json
import pathlib

SCRIPT_DIR = pathlib.Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / 'td-route-manual-input'


def prompt(msg, default=None, cast=str, allow_empty=False):
    suffix = f' [{default}]' if default is not None else ''
    while True:
        val = input(f'{msg}{suffix}: ').strip()
        if not val:
            if default is not None:
                return default
            if allow_empty:
                return None
            print('  (필수 항목)')
            continue
        if val.lower() in ('null', 'none', '-', ''):
            return None
        try:
            return cast(val)
        except (ValueError, TypeError):
            print(f'  올바른 {cast.__name__} 형식으로 입력하세요')


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print('터치다운 플레이 수동 매핑 입력 도구')
    print('종료: Ctrl+C  |  빈 값/null: 그냥 엔터 또는 "null"\n')

    while True:
        print('─' * 60)
        game_key = prompt('gameKey (예: HIcowboys_20250913_vs_KMrazorbacks)')
        if not game_key:
            break
        clip_key = prompt('clipKey (엑셀 DataSheet의 ClipKey 값)')
        if clip_key is None:
            break

        tracking_file = prompt('trackingJsonFile (tracking_output/ 안의 파일명)')
        if not tracking_file:
            print('  tracking 파일명은 필수입니다')
            continue

        frame_start = prompt('frameRange 시작 프레임 번호', cast=int)
        frame_end = prompt('frameRange 종료 프레임 번호', cast=int)
        if frame_start is None or frame_end is None:
            print('  frameRange는 필수입니다')
            continue

        scorer_track = prompt('scorerTrackId (영상에서 확인한 득점 선수 track_id)', cast=int)
        scorer_jersey = prompt('scorerJerseyNumber (득점 선수 등번호)', cast=int, allow_empty=True)

        is_pass = input('패스 TD입니까? (y/N): ').strip().lower() == 'y'
        if is_pass:
            passer_track = prompt('passerTrackId (QB의 track_id)', cast=int, allow_empty=True)
            passer_jersey = prompt('passerJerseyNumber (QB 등번호)', cast=int, allow_empty=True) if passer_track else None
        else:
            passer_track = None
            passer_jersey = None

        own_goal_end = prompt(
            'ownGoalEnd (득점팀이 왼쪽→오른쪽 전진이면 top_left, 오른쪽→왼쪽이면 top_right)',
            default='top_left',
        )

        data = {
            'gameKey': game_key,
            'clipKey': str(clip_key),
            'trackingJsonFile': tracking_file,
            'frameRange': [frame_start, frame_end],
            'scorerTrackId': scorer_track,
            'scorerJerseyNumber': scorer_jersey,
            'passerTrackId': passer_track,
            'passerJerseyNumber': passer_jersey,
            'ownGoalEnd': own_goal_end,
        }

        out_path = OUTPUT_DIR / f'{game_key}__{clip_key}.json'
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'\n저장 완료: {out_path}\n')

        again = input('다음 플레이 입력? (Y/n): ').strip().lower()
        if again == 'n':
            break

    print('종료')


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\n종료')
