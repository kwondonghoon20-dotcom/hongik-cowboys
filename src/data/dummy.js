export const OUR_TEAM = '홍익대학교 카우보이스'

export const games = [
  {
    id: 'g1',
    season: 2025,
    week: 1,
    date: '2025-09-06',
    gameType: 'League',
    venue: '홍익대학교 운동장',
    homeTeam: OUR_TEAM,
    awayTeam: '연세대학교 이글스',
    isHome: true,
    homeScore: 28,
    awayScore: 14,
    teamStats: {
      home: { totalYards: 412, rushYards: 188, passYards: 224, turnovers: 1, thirdDown: '7/13' },
      away: { totalYards: 301, rushYards: 110, passYards: 191, turnovers: 2, thirdDown: '4/12' },
    },
    mvp: { id: 'p6', name: '김주찬', number: 12, position: 'QB', highlight: '224 패스야드 · 3 TD' },
    playLog: [
      { quarter: 1, time: '11:24', team: OUR_TEAM, description: '김주찬 → 어서검 32야드 패스 TD', yards: 32 },
      { quarter: 1, time: '04:02', team: '연세대학교 이글스', description: '러닝백 14야드 TD 런', yards: 14 },
      { quarter: 2, time: '08:51', team: OUR_TEAM, description: '김세윤 6야드 런 TD', yards: 6 },
      { quarter: 3, time: '09:40', team: OUR_TEAM, description: '김주찬 → 어서검 18야드 패스 TD', yards: 18 },
      { quarter: 3, time: '02:15', team: '연세대학교 이글스', description: '필드골 32야드 성공', yards: 0 },
      { quarter: 4, time: '06:33', team: OUR_TEAM, description: '권용욱 인터셉트 후 21야드 리턴', yards: 21 },
    ],
  },
  {
    id: 'g2',
    season: 2025,
    week: 2,
    date: '2025-09-20',
    gameType: 'League',
    venue: '고려대학교 운동장',
    homeTeam: '고려대학교 타이거스',
    awayTeam: OUR_TEAM,
    isHome: false,
    homeScore: 21,
    awayScore: 17,
    teamStats: {
      home: { totalYards: 358, rushYards: 201, passYards: 157, turnovers: 0, thirdDown: '6/11' },
      away: { totalYards: 295, rushYards: 102, passYards: 193, turnovers: 3, thirdDown: '3/13' },
    },
    mvp: { id: 'p9', name: '어서검', number: 1, position: 'WR', highlight: '8리셉션 · 121야드 · 1 TD' },
    playLog: [
      { quarter: 1, time: '09:12', team: '고려대학교 타이거스', description: '러닝백 22야드 TD 런', yards: 22 },
      { quarter: 2, time: '07:48', team: OUR_TEAM, description: '김주찬 → 어서검 27야드 패스 TD', yards: 27 },
      { quarter: 3, time: '10:05', team: '고려대학교 타이거스', description: 'QB 9야드 TD 런', yards: 9 },
      { quarter: 4, time: '12:00', team: OUR_TEAM, description: '필드골 38야드 성공', yards: 0 },
      { quarter: 4, time: '03:20', team: '고려대학교 타이거스', description: '필드골 41야드 성공', yards: 0 },
    ],
  },
  {
    id: 'g3',
    season: 2025,
    week: 3,
    date: '2025-10-04',
    gameType: 'Scrimmage',
    venue: '홍익대학교 운동장',
    homeTeam: OUR_TEAM,
    awayTeam: '서강대학교 알룸나이',
    isHome: true,
    homeScore: 35,
    awayScore: 10,
    teamStats: {
      home: { totalYards: 455, rushYards: 240, passYards: 215, turnovers: 0, thirdDown: '9/12' },
      away: { totalYards: 210, rushYards: 90, passYards: 120, turnovers: 4, thirdDown: '2/10' },
    },
    mvp: { id: 'p4', name: '김세윤', number: 23, position: 'RB', highlight: '18캐리 · 152야드 · 2 TD' },
    playLog: [
      { quarter: 1, time: '10:30', team: OUR_TEAM, description: '김세윤 41야드 런 TD', yards: 41 },
      { quarter: 1, time: '02:18', team: '서강대학교 알룸나이', description: '필드골 29야드 성공', yards: 0 },
      { quarter: 2, time: '06:44', team: OUR_TEAM, description: '김세윤 12야드 런 TD', yards: 12 },
      { quarter: 3, time: '11:02', team: OUR_TEAM, description: '박민수 인터셉트 후 35야드 리턴 TD', yards: 35 },
      { quarter: 4, time: '08:09', team: '서강대학교 알룸나이', description: '러닝백 7야드 TD 런', yards: 7 },
    ],
  },
  {
    id: 'g4',
    season: 2025,
    week: 4,
    date: '2025-10-18',
    gameType: 'League',
    venue: '한양대학교 운동장',
    homeTeam: '한양대학교 라이온스',
    awayTeam: OUR_TEAM,
    isHome: false,
    homeScore: 20,
    awayScore: 24,
    teamStats: {
      home: { totalYards: 320, rushYards: 150, passYards: 170, turnovers: 2, thirdDown: '5/12' },
      away: { totalYards: 388, rushYards: 175, passYards: 213, turnovers: 1, thirdDown: '8/14' },
    },
    mvp: { id: 'p6', name: '김주찬', number: 12, position: 'QB', highlight: '213 패스야드 · 2 TD · 1 INT' },
    playLog: [
      { quarter: 1, time: '08:55', team: '한양대학교 라이온스', description: '러닝백 18야드 TD 런', yards: 18 },
      { quarter: 2, time: '05:10', team: OUR_TEAM, description: '김주찬 → 어서검 24야드 패스 TD', yards: 24 },
      { quarter: 3, time: '09:33', team: '한양대학교 라이온스', description: 'QB 5야드 TD 런', yards: 5 },
      { quarter: 3, time: '01:47', team: OUR_TEAM, description: '김세윤 9야드 런 TD', yards: 9 },
      { quarter: 4, time: '04:21', team: OUR_TEAM, description: '필드골 27야드 성공', yards: 0 },
      { quarter: 4, time: '00:58', team: '한양대학교 라이온스', description: '필드골 33야드 성공', yards: 0 },
    ],
  },
  {
    id: 'g5',
    season: 2026,
    week: 1,
    date: '2026-09-05',
    gameType: 'Scrimmage',
    venue: '홍익대학교 운동장',
    homeTeam: OUR_TEAM,
    awayTeam: '서울대학교 시저스',
    isHome: true,
    homeScore: 31,
    awayScore: 27,
    teamStats: {
      home: { totalYards: 401, rushYards: 165, passYards: 236, turnovers: 2, thirdDown: '6/14' },
      away: { totalYards: 389, rushYards: 140, passYards: 249, turnovers: 1, thirdDown: '7/13' },
    },
    mvp: { id: 'p9', name: '어서검', number: 1, position: 'WR', highlight: '9리셉션 · 138야드 · 2 TD' },
    playLog: [
      { quarter: 1, time: '10:01', team: OUR_TEAM, description: '김주찬 → 어서검 29야드 패스 TD', yards: 29 },
      { quarter: 2, time: '06:22', team: '서울대학교 시저스', description: 'QB 11야드 TD 런', yards: 11 },
      { quarter: 3, time: '07:15', team: OUR_TEAM, description: '어서검 33야드 패스 TD', yards: 33 },
      { quarter: 4, time: '02:40', team: '서울대학교 시저스', description: '필드골 36야드 성공', yards: 0 },
    ],
  },
]

// 포지션: offense/defense 겸업 표기. 등번호는 학년 간 중복 허용.
export const players = [
  // 1학년 26학번
  { id: 'p1', grade: 1, year: 26, number: 67, name: '김민영', positions: { offense: 'OL', defense: 'DL' }, height: null, weight: null },
  { id: 'p2', grade: 1, year: 26, number: 55, name: '곽정우', positions: { offense: 'OL', defense: 'DL' }, height: null, weight: null },
  { id: 'p3', grade: 1, year: 26, number: 4, name: '김민석', positions: { offense: 'RB', defense: 'LB' }, height: null, weight: null },

  // 2학년 25학번
  { id: 'p4', grade: 2, year: 25, number: 23, name: '김세윤', positions: { offense: 'RB', defense: 'LB' }, height: 169, weight: 67 },
  { id: 'p5', grade: 2, year: 25, number: 73, name: '김동현', positions: { offense: 'OL', defense: 'DL' }, height: 194, weight: 110 },
  { id: 'p6', grade: 2, year: 25, number: 12, name: '김주찬', positions: { offense: 'QB', defense: 'DL' }, height: 182, weight: 81 },
  { id: 'p7', grade: 2, year: 25, number: 4, name: '김민성', positions: { offense: 'WR', defense: 'DB' }, height: 175, weight: 71 },
  { id: 'p8', grade: 2, year: 25, number: 74, name: '전규환', positions: { offense: 'OL', defense: 'DL' }, height: 176, weight: 90 },
  { id: 'p9', grade: 2, year: 25, number: 1, name: '어서검', positions: { offense: 'WR', defense: 'DB' }, height: 185, weight: 80 },

  // 2학년 24학번
  { id: 'p10', grade: 2, year: 24, number: 10, name: '박은민', positions: { offense: 'WR', defense: 'DB' }, height: 179, weight: 68 },
  { id: 'p11', grade: 2, year: 24, number: 27, name: '정형민', positions: { offense: 'OL', defense: 'DL' }, height: 176, weight: 82 },
  { id: 'p12', grade: 2, year: 24, number: 11, name: '이성원', positions: { offense: 'RB', defense: 'LB' }, height: 179, weight: 76 },
  { id: 'p13', grade: 2, year: 24, number: 22, name: '김민혁', positions: { offense: 'RB', defense: 'LB' }, height: 171, weight: 74 },

  // 3학년 24학번
  { id: 'p14', grade: 3, year: 24, number: 88, name: '김민규', positions: { offense: 'TE', defense: 'LB' }, height: null, weight: null },
  { id: 'p15', grade: 3, year: 24, number: 72, name: '정윤우', positions: { offense: 'OL', defense: 'LB' }, height: 169, weight: 83 },

  // 3학년 23학번
  { id: 'p16', grade: 3, year: 23, number: 14, name: '박민수', positions: { offense: 'WR', defense: 'DB' }, height: 184, weight: 80 },
  { id: 'p17', grade: 3, year: 23, number: 61, name: '이우진', positions: { offense: 'OL', defense: 'DL' }, height: 180, weight: 105 },
  { id: 'p18', grade: 3, year: 23, number: 54, name: '황종택', positions: { offense: 'OL', defense: 'DL' }, height: 185, weight: 87 },

  // 3학년 22학번
  { id: 'p19', grade: 3, year: 22, number: 57, name: '권동훈', positions: { offense: 'RB', defense: 'LB' }, height: 171, weight: 75 },
  { id: 'p20', grade: 3, year: 22, number: 77, name: '강민재', positions: { offense: 'OL', defense: 'DL' }, height: 175, weight: 92 },
  { id: 'p21', grade: 3, year: 22, number: 7, name: '양준환', positions: { offense: 'QB', defense: 'DB' }, height: null, weight: null },

  // 3학년 21학번
  { id: 'p22', grade: 3, year: 21, number: 26, name: '권순웅', positions: { offense: 'RB', defense: 'LB' }, height: 170, weight: 77 },
  { id: 'p23', grade: 3, year: 21, number: 33, name: '김기웅', positions: { offense: 'WR', defense: 'DB' }, height: 178, weight: 74 },
  { id: 'p24', grade: 3, year: 21, number: 25, name: '김준호', positions: { offense: 'RB', defense: 'DL' }, height: 171, weight: 75 },

  // 4학년 23학번
  { id: 'p25', grade: 4, year: 23, number: 9, name: '권용욱', positions: { offense: 'QB', defense: 'LB' }, height: 174, weight: 76 },

  // 4학년 22학번
  { id: 'p26', grade: 4, year: 22, number: 17, name: '김찬용', positions: { offense: 'WR', defense: 'LB' }, height: 177, weight: 73 },
  { id: 'p27', grade: 4, year: 22, number: 2, name: '고극', positions: { offense: 'WR', defense: 'DB' }, height: 178, weight: 65 },
  { id: 'p28', grade: 4, year: 22, number: 19, name: '최재서', positions: { offense: 'RB', defense: 'DB' }, height: 177, weight: 70 },

  // 4학년 21학번
  { id: 'p29', grade: 4, year: 21, number: 60, name: '최호재', positions: { offense: 'OL', defense: 'DL' }, height: 180, weight: 120 },

  // 4학년 20학번
  { id: 'p30', grade: 4, year: 20, number: 66, name: '송준석', positions: { offense: 'OL', defense: 'DL' }, height: 180, weight: 93 },
]

export const coaches = [
  { id: 'c1', role: '감독', name: '류두형', year: 11, isOB: true, isHeadCoach: true },
  { id: 'c2', role: 'OC (오펜스 코디네이터)', name: '김영현', year: 17, isOB: true },
  { id: 'c3', role: 'DC (디펜스 코디네이터)', name: '권오윤', year: 17, isOB: true },
  { id: 'c4', role: 'OL/DL 코치', name: '홍원석', year: 13, isOB: true },
  { id: 'c5', role: 'LB 코치', name: '정구중', year: 9, isOB: true },
  { id: 'c6', role: 'LB 코치', name: '김상현', year: 19, isOB: true },
]

export const managers = [
  { id: 'm1', name: '노경주', year: 22 },
  { id: 'm2', name: '김영현', year: 22 },
  { id: 'm3', name: '이서현', year: 23 },
  { id: 'm4', name: '김예원', year: 25 },
  { id: 'm5', name: '홍다희', year: 25 },
  { id: 'm6', name: '김지민', year: 25 },
  { id: 'm7', name: '서혜림', year: 25 },
]
