# 경기 엑셀 파일 폴더

파일 네이밍 규칙: `HIcowboys_YYYYMMDD_vs_상대팀.xlsm`

예: `HIcowboys_20240907_vs_서울대.xlsm`

이 폴더에 `.xlsm` 파일을 넣으면 `src/utils/parseExcel.js`의 `loadGamesFromFolder()`가
`import.meta.glob`으로 자동 수집해서 파싱한다.
