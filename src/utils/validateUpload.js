import { OUR_TEAM, KNOWN_TEAMS, normalizeNum } from './parseExcel'
import { players } from '../data/dummy'

// getPlayerStats()의 ok() 체크와 동일한 기준(0/빈 값 제외).
function ok(raw) {
  return raw != null && raw !== '' && String(raw).trim() !== '' && Number(raw) !== 0
}

// 엑셀 업로드 시 흔한 실수 두 가지를 경고로 잡아낸다: (1) normalizeTeamName이 인식하지
// 못해 원본 문자열이 그대로 팀명으로 남은 경우, (2) 우리 팀 등번호가 dummy.js 로스터에
// 없는 경우(오타 또는 신규 선수 미등록). 둘 다 업로드 자체를 막지는 않는 참고용 경고다.
export function validateGameData({ meta, plays }) {
  const warnings = []

  for (const team of [meta?.home, meta?.away]) {
    if (!team) continue
    if (!KNOWN_TEAMS.includes(team)) {
      warnings.push(`인식되지 않는 팀명: '${team}' (normalizeTeamName 매핑에 없어 정규화되지 않았을 수 있습니다)`)
    }
  }

  const ourTeamName = meta?.home === OUR_TEAM ? meta.home : meta?.away === OUR_TEAM ? meta.away : null

  if (ourTeamName && Array.isArray(plays)) {
    const rosterNums = new Set(
      players.filter((p) => p.number != null).map((p) => normalizeNum(p.number))
    )

    const counts = new Map()
    const bump = (raw) => {
      if (!ok(raw)) return
      const num = normalizeNum(raw)
      counts.set(num, (counts.get(num) ?? 0) + 1)
    }

    for (const play of plays) {
      if (play.OffenseTeam === ourTeamName) {
        bump(play.CARNum)
        bump(play.CAR2Num)
      } else {
        bump(play.TKLNum)
        bump(play.TKL2Num)
      }
    }

    const unknownNums = [...counts.entries()]
      .filter(([num]) => !rosterNums.has(num))
      .sort((a, b) => Number(a[0]) - Number(b[0]))

    for (const [num, count] of unknownNums) {
      warnings.push(`로스터에 없는 등번호: #${num} (${count}건 플레이)`)
    }
  }

  return warnings
}
