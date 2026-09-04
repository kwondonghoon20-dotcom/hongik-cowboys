import { useState } from 'react'
import { parseGame, calcTeamStats, getTouchdownPlays } from '../utils/parseExcel'
import { validateGameData } from '../utils/validateUpload'
import { addUploadedGame } from '../data/uploadedGames'
import './ExcelUploader.css'

const SUMMARY_ROWS = [
  { key: 'totalYards', label: '총 야드' },
  { key: 'rushYards', label: '러싱 야드' },
  { key: 'passYards', label: '패싱 야드' },
  { key: 'rushAttempts', label: '러싱 시도' },
  { key: 'passAttempts', label: '패싱 시도' },
  { key: 'totalPlays', label: '총 플레이' },
  { key: 'turnovers', label: '턴오버' },
  { key: 'thirdDown', label: '3rd Down' },
  { key: 'touchdowns', label: '터치다운' },
]

export default function ExcelUploader({ onUploaded }) {
  const [status, setStatus] = useState('idle')
  const [fileName, setFileName] = useState(null)
  const [warnings, setWarnings] = useState([])
  const [summary, setSummary] = useState(null)

  async function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setStatus('parsing')
    setWarnings([])
    setSummary(null)

    try {
      const { meta, plays } = await parseGame(file)
      const homeStats = calcTeamStats(plays, meta.home ?? 'Home')
      const awayStats = calcTeamStats(plays, meta.away ?? 'Away')
      const touchdownPlays = getTouchdownPlays(plays)
      const homeTouchdowns = touchdownPlays.filter((p) => p.OffenseTeam === meta.home).length
      const awayTouchdowns = touchdownPlays.filter((p) => p.OffenseTeam === meta.away).length

      console.log('[엑셀 파싱] meta:', meta)
      console.log('[엑셀 파싱] plays:', plays)
      console.log('[엑셀 파싱] home 팀 스탯:', homeStats)
      console.log('[엑셀 파싱] away 팀 스탯:', awayStats)

      const gameWarnings = validateGameData({ meta, plays })
      if (gameWarnings.length > 0) {
        console.warn('[엑셀 파싱 경고]', gameWarnings)
      }
      setWarnings(gameWarnings)
      setSummary({
        meta,
        home: { ...homeStats, touchdowns: homeTouchdowns },
        away: { ...awayStats, touchdowns: awayTouchdowns },
      })

      const id = meta.gameKey ?? `${file.name}-${Date.now()}`
      addUploadedGame({ id, filename: file.name, meta, plays })

      setStatus('done')
      onUploaded?.()
    } catch (err) {
      console.error('[엑셀 파싱 실패]', err)
      setStatus('error')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="excel-uploader">
      <label className="excel-uploader-label">
        개발용 엑셀 업로드 (.xlsx / .xlsm)
        <input type="file" accept=".xlsx,.xlsm" onChange={handleChange} />
      </label>
      {fileName && (
        <p className="excel-uploader-status">
          {fileName} —{' '}
          {status === 'parsing' && '파싱 중...'}
          {status === 'done' && '파싱 완료 · 경기 목록에 추가됨'}
          {status === 'error' && '파싱 실패 (콘솔 확인)'}
        </p>
      )}
      {status === 'done' && summary && (
        <div className="excel-uploader-summary">
          <div className="excel-uploader-summary-header">
            <span>{summary.meta.home} vs {summary.meta.away}</span>
            <span>{summary.meta.date}</span>
            <span>{summary.meta.homeScore ?? '-'} : {summary.meta.awayScore ?? '-'}</span>
          </div>
          <table className="excel-uploader-summary-table">
            <thead>
              <tr>
                <th>{summary.meta.home}</th>
                <th></th>
                <th>{summary.meta.away}</th>
              </tr>
            </thead>
            <tbody>
              {SUMMARY_ROWS.map((row) => (
                <tr key={row.key}>
                  <td>{summary.home[row.key]}</td>
                  <td className="excel-uploader-summary-label">{row.label}</td>
                  <td>{summary.away[row.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {status === 'done' && warnings.length > 0 && (
        <ul className="excel-uploader-warnings">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
