# TD Route Manual Input

각 터치다운 플레이의 수동 매핑 JSON 파일을 이 폴더에 저장합니다.

파일명 규칙: `<GameKey>__<ClipKey>.json`

예: `HIcowboys_20250913_vs_KMrazorbacks__42.json`

## 필드 설명

| 필드 | 설명 |
|------|------|
| `gameKey` | `gameRepository.js`의 `XLSX_META_MAP` 키와 동일한 경기 식별자 |
| `clipKey` | 엑셀 DataSheet의 `ClipKey` 값 (문자열) |
| `trackingJsonFile` | `cv-pipeline/tracking_output/` 안의 파일명 |
| `frameRange` | 플레이 시작~종료 프레임 번호 `[start, end]` (inclusive) |
| `scorerTrackId` | 득점 선수의 track_id (영상 확인 필요) |
| `scorerJerseyNumber` | 득점 선수의 실제 등번호 |
| `passerTrackId` | 패스TD일 때 QB의 track_id (러싱TD면 null) |
| `passerJerseyNumber` | 패스TD일 때 QB의 등번호 (러싱TD면 null) |
| `ownGoalEnd` | 득점팀 자기 진영 골라인 방향: `"top_left"` 또는 `"top_right"` |

## ownGoalEnd 결정 방법

드론 영상에서 득점팀이 어느 방향으로 전진하는지 확인:
- 득점팀이 **왼쪽→오른쪽**으로 전진: `"top_left"` (자기 골라인이 왼쪽)
- 득점팀이 **오른쪽→왼쪽**으로 전진: `"top_right"` (자기 골라인이 오른쪽)

## 입력 방법

터미널에서:
```bash
cd cv-pipeline
python create_manual_input.py
```
