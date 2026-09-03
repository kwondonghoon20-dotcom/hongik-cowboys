import { useMemo, useState } from 'react'
import { players } from '../data/dummy'
import { POSITIONS } from './Roster'
import { getAllGames, useGlobGames } from '../data/gameRepository'
import { getSeasonPlayerStats, OUR_TEAM } from '../utils/parseExcel'
import { computeSeasonTotals, getStatFlags, buildSeasonBoxes, buildCompareRows } from '../utils/seasonStats'
import './Compare.css'

const CATEGORY_ALL = '전체'

function PlayerPicker({ label, selected, onSelect, onClear, excludeId }) {
  const [category, setCategory] = useState(CATEGORY_ALL)
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return players
      .filter((p) => p.id !== excludeId)
      .filter((p) =>
        category === CATEGORY_ALL ||
        p.positions.offense === category ||
        p.positions.defense === category ||
        p.positions.special === category
      )
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.number != null && String(p.number).includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }, [category, query, excludeId])

  return (
    <div className="picker">
      <span className="picker-label">{label}</span>
      {selected ? (
        <div className="picker-selected">
          <div className="picker-selected-number">
            {selected.number != null ? `#${selected.number}` : '#-'}
          </div>
          <div className="picker-selected-info">
            <div className="picker-selected-name">{selected.name}</div>
            <div className="picker-selected-meta">
              {selected.positions.offense} / {selected.positions.defense}
              {selected.positions?.special ? ` / ${selected.positions.special}` : ''}
              {' · '}{selected.grade}학년
            </div>
          </div>
          <button className="picker-clear-btn" onClick={onClear}>변경</button>
        </div>
      ) : (
        <div className="picker-panel">
          <div className="picker-chips">
            <button
              className={'picker-chip' + (category === CATEGORY_ALL ? ' active' : '')}
              onClick={() => setCategory(CATEGORY_ALL)}
            >
              전체
            </button>
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                className={'picker-chip' + (category === pos ? ' active' : '')}
                onClick={() => setCategory(pos)}
              >
                {pos}
              </button>
            ))}
          </div>
          <input
            className="picker-input"
            type="text"
            placeholder="이름/등번호로 좁히기"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="picker-list">
            {list.map((p) => (
              <li key={p.id}>
                <button className="picker-list-item" onClick={() => onSelect(p)}>
                  <span className="picker-list-number">
                    {p.number != null ? `#${p.number}` : '#-'}
                  </span>
                  <span className="picker-list-name">{p.name}</span>
                  <span className="picker-list-pos">
                    {p.positions.offense}/{p.positions.defense}
                    {p.positions?.special ? `/${p.positions.special}` : ''}
                  </span>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="picker-list-empty">일치하는 선수가 없습니다.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

function usePlayerSeasonData(player, realGames) {
  return useMemo(() => {
    if (!player || player.number == null) return null
    const gameRows = getSeasonPlayerStats(realGames, player.number, OUR_TEAM)
    const { sOff, sDef, sKick } = computeSeasonTotals(gameRows)
    const flags = getStatFlags(sOff, sDef, sKick)
    return { sOff, sDef, sKick, flags }
  }, [player, realGames])
}

function SoloSeasonStats({ player, data }) {
  if (!data || !data.flags.hasAnyStats) {
    return <p className="empty-note">플레이별 데이터가 있는 경기가 로드되면 스탯이 표시됩니다.</p>
  }
  const boxes = buildSeasonBoxes(data.sOff, data.sDef, data.sKick, data.flags)
  return (
    <div className="season-stats">
      {boxes.map((s) => (
        <div key={s.name} className="season-stat-box">
          <span className="season-stat-value">{s.value}</span>
          <span className="season-stat-name">{s.name}</span>
        </div>
      ))}
    </div>
  )
}

export default function Compare() {
  const globGames = useGlobGames()
  const [playerAId, setPlayerAId] = useState(null)
  const [playerBId, setPlayerBId] = useState(null)

  const realGames = useMemo(() => {
    const sync = getAllGames()
    const globIds = new Set(globGames.map((g) => g.id))
    const deduped = sync.filter((g) => !globIds.has(g.id))
    return [...deduped, ...globGames]
  }, [globGames])

  const playerA = playerAId ? players.find((p) => p.id === playerAId) : null
  const playerB = playerBId ? players.find((p) => p.id === playerBId) : null

  const dataA = usePlayerSeasonData(playerA, realGames)
  const dataB = usePlayerSeasonData(playerB, realGames)

  const compareRows = useMemo(() => {
    if (!dataA || !dataB) return []
    return buildCompareRows(dataA, dataB)
  }, [dataA, dataB])

  const bothSelected = Boolean(playerA && playerB)
  const noneSelected = !playerA && !playerB

  return (
    <div className="page-compare">
      <div className="compare-hero">
        <div className="container">
          <h1>스탯 비교</h1>
          <p>두 선수의 시즌 누적 스탯을 나란히 비교합니다.</p>
        </div>
      </div>

      <div className="container">
        <div className="compare-pickers">
          <PlayerPicker
            label="선수 A"
            selected={playerA}
            excludeId={playerBId}
            onSelect={(p) => setPlayerAId(p.id)}
            onClear={() => setPlayerAId(null)}
          />
          <div className="compare-vs">VS</div>
          <PlayerPicker
            label="선수 B"
            selected={playerB}
            excludeId={playerAId}
            onSelect={(p) => setPlayerBId(p.id)}
            onClear={() => setPlayerBId(null)}
          />
        </div>

        {noneSelected && (
          <section className="section">
            <p className="empty-note">비교할 선수 두 명을 선택하세요.</p>
          </section>
        )}

        {!bothSelected && !noneSelected && (
          <section className="section">
            <h3 className="section-title">
              {playerA ? `${playerA.name} 시즌 누적 스탯` : `${playerB.name} 시즌 누적 스탯`}
            </h3>
            <SoloSeasonStats player={playerA ?? playerB} data={playerA ? dataA : dataB} />
            <p className="empty-note compare-hint">
              나머지 한 명을 선택하면 비교표가 표시됩니다.
            </p>
          </section>
        )}

        {bothSelected && (
          <section className="section">
            <h3 className="section-title">시즌 누적 스탯 비교</h3>
            {compareRows.length === 0 ? (
              <p className="empty-note">두 선수 모두 집계된 플레이별 스탯이 없습니다.</p>
            ) : (
              <div className="compare-table-scroll">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th className="compare-col-a">{playerA.name}</th>
                      <th className="compare-col-stat">스탯</th>
                      <th className="compare-col-b">{playerB.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((row) => (
                      <tr key={row.name}>
                        <td className={'compare-value compare-col-a' + (row.winner === 'A' ? ' winner' : '')}>
                          {row.displayA}
                        </td>
                        <td className="compare-stat-name">{row.name}</td>
                        <td className={'compare-value compare-col-b' + (row.winner === 'B' ? ' winner' : '')}>
                          {row.displayB}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
