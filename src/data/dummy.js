export const OUR_TEAM = '홍익대학교 카우보이스'

export const games = []

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

// 학번은 앞자리 0이 있는 경우(예: 09학번)도 정상 표시되도록 문자열로 저장.
export const coaches = [
  { id: 'c1', role: '감독', name: '류두형', year: '11', isOB: true, isHeadCoach: true },
  { id: 'c2', role: 'OC (오펜스 코디네이터)', name: '김영현', year: '17', isOB: true },
  { id: 'c3', role: 'DC (디펜스 코디네이터)', name: '권오윤', year: '17', isOB: true },
  { id: 'c4', role: 'OL/DL 코치', name: '홍원석', year: '13', isOB: true },
  { id: 'c5', role: 'LB 코치', name: '정구중', year: '09', isOB: true },
  { id: 'c6', role: 'LB 코치', name: '김상현', year: '19', isOB: true },
]

export const managers = [
  { id: 'm1', name: '노경주', year: '22' },
  { id: 'm2', name: '김영현', year: '22' },
  { id: 'm3', name: '이서현', year: '23' },
  { id: 'm4', name: '김예원', year: '25' },
  { id: 'm5', name: '홍다희', year: '25' },
  { id: 'm6', name: '김지민', year: '25' },
  { id: 'm7', name: '서혜림', year: '25' },
]
