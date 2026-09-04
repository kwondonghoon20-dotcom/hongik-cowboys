import { useState, useCallback } from 'react'
import { FORMATIONS } from '../data/formations'
import { SHELLS } from '../data/coverages'
import { COVERAGE_QUIZ_PLAYS } from '../data/playbook'
import FieldCanvas from '../components/tactics/FieldCanvas'
import './CoverageQuiz.css'

const COVERAGE_TYPES = ['man', 'cover2', 'cover3', 'cover4']

const COVERAGE_LABELS = {
  man: 'Man (Cover 1)',
  cover2: 'Cover 2',
  cover3: 'Cover 3',
  cover4: 'Cover 4',
}

// Cover 3은 4-4/4-3 어느 쪽 셸이든 화면엔 그냥 "Cover 3"로만 보여준다(요구사항 3번).
function pickShellKey(coverageType) {
  if (coverageType === 'man') return 'cover1'
  if (coverageType === 'cover3') return Math.random() < 0.5 ? 'cover3_44' : 'cover3_43'
  return coverageType // 'cover2' | 'cover4' — SHELLS 키와 동일
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickQuestion() {
  const play = pickRandom(COVERAGE_QUIZ_PLAYS)
  const coverageType = pickRandom(COVERAGE_TYPES)
  const shellKey = pickShellKey(coverageType)
  return { play, coverageType, shellKey }
}

function keyOf(side, role) {
  return side + ':' + role
}

// 포메이션/셸 정의를 FieldCanvas가 바로 그릴 수 있는 players/assignments로 펼친다.
// playerId는 로스터와 무관한 합성 값(역할 이름 그대로) — 이 훈련은 특정 선수가 아니라
// role 기반 판단이 핵심이라 실제 선수 매핑이 필요 없다.
function buildSide(side, formationKey, roleAssignments, assignmentKind) {
  const formation = FORMATIONS[formationKey]
  const players = formation.slots.map((slot) => ({
    key: keyOf(side, slot.role),
    playerId: keyOf(side, slot.role),
    side,
    x: slot.x,
    d: slot.d,
    role: slot.role,
    pos: slot.pos,
  }))
  const assignments = {}
  Object.entries(roleAssignments).forEach(([role, presetId]) => {
    assignments[keyOf(side, role)] = { kind: assignmentKind, id: presetId, flip: false }
  })
  return { players, assignments }
}

function explain(coverageType, roles, estimated) {
  const roleText = roles.join(' / ')
  const suffix = estimated ? ' ([이론 추정])' : ''
  if (coverageType === 'man') {
    return `맨 커버리지에서는 매치업 우위나 픽 활용이 관건이라 ${roleText}가 정답입니다.${suffix}`
  }
  if (coverageType === 'cover2') {
    return `Cover 2는 딥이 두 명뿐이라 하프 사이·플랫 공간이 비어 ${roleText}가 정답입니다.${suffix}`
  }
  if (coverageType === 'cover3') {
    return `Cover 3는 언더니스가 얇아서 ${roleText}의 라우트가 정답입니다.${suffix}`
  }
  return `Cover 4(쿼터스)는 딥이 네 명이라 언더니스가 가장 얇아, 가장 짧고 빠른 ${roleText} 라우트가 정답입니다.${suffix}`
}

export default function CoverageQuiz() {
  const [question, setQuestion] = useState(pickQuestion)
  const [picked, setPicked] = useState(null)

  const nextQuestion = useCallback(() => {
    setQuestion(pickQuestion())
    setPicked(null)
  }, [])

  const { play, coverageType, shellKey } = question
  const shell = SHELLS[shellKey]

  const offense = buildSide('offense', play.formation, play.routes, 'route')
  const defense = buildSide('defense', shell.base, shell.assign, 'coverage')
  const players = [...offense.players, ...defense.players]
  const assignments = { ...offense.assignments, ...defense.assignments }

  const candidateRoles = Object.keys(play.routes)
  const correctRoles = play.coverageReads[coverageType]
  const isCorrect = picked != null && correctRoles.includes(picked)

  const noop = () => {}

  return (
    <div className="page-coverage-quiz">
      <div className="quiz-hero">
        <div className="container">
          <h1>커버리지 판단 훈련</h1>
          <p>디펜스 커버리지를 보고, 이 작전에서 누구에게 던져야 할지 골라보세요.</p>
        </div>
      </div>

      <div className="container">
        <div className="quiz-main">
          <div className="quiz-field-col">
            <FieldCanvas
              players={players}
              assignments={assignments}
              selectedKey={null}
              onSelectPlayer={noop}
              onMovePlayer={noop}
              onRemovePlayer={noop}
              onSetShape={noop}
              rosterPlayers={[]}
              showNames={false}
              showCovLabels
            />
          </div>

          <div className="quiz-panel">
            <div className="quiz-play-name">{play.name}</div>
            <div className="quiz-coverage-badge">{COVERAGE_LABELS[coverageType]}</div>

            <h3 className="quiz-question">이 작전에서 누구에게 던져야 할까?</h3>

            <div className="quiz-choices">
              {candidateRoles.map((role) => {
                const isPicked = picked === role
                const showState = picked != null && (isPicked || correctRoles.includes(role))
                const state = !showState ? '' : correctRoles.includes(role) ? ' correct' : ' wrong'
                return (
                  <button
                    key={role}
                    className={'quiz-choice-btn' + state}
                    disabled={picked != null}
                    onClick={() => setPicked(role)}
                  >
                    {role}
                  </button>
                )
              })}
            </div>

            {picked != null && (
              <div className={'quiz-result' + (isCorrect ? ' correct' : ' wrong')}>
                <div className="quiz-result-title">{isCorrect ? '정답!' : '오답'}</div>
                <p className="quiz-result-explain">
                  {explain(coverageType, correctRoles, play.cover4Estimated && coverageType === 'cover4')}
                </p>
              </div>
            )}

            <button className="quiz-next-btn" onClick={nextQuestion}>
              다음 문제
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
