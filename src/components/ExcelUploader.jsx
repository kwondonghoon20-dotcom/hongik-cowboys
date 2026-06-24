import { useState } from 'react'
import { parseGame, calcTeamStats } from '../utils/parseExcel'
import { addUploadedGame } from '../data/uploadedGames'
import './ExcelUploader.css'

export default function ExcelUploader({ onUploaded }) {
  const [status, setStatus] = useState('idle')
  const [fileName, setFileName] = useState(null)

  async function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setStatus('parsing')

    try {
      const { meta, plays } = await parseGame(file)
      const homeStats = calcTeamStats(plays, meta.home ?? 'Home')
      const awayStats = calcTeamStats(plays, meta.away ?? 'Away')

      console.log('[엑셀 파싱] meta:', meta)
      console.log('[엑셀 파싱] plays:', plays)
      console.log('[엑셀 파싱] home 팀 스탯:', homeStats)
      console.log('[엑셀 파싱] away 팀 스탯:', awayStats)

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
    </div>
  )
}
