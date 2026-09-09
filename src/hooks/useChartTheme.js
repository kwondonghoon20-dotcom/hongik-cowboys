import { useState, useEffect } from 'react'

function readThemeColors() {
  const isDark = document.documentElement.classList.contains('dark')
  const styles = getComputedStyle(document.documentElement)
  const get = (name, fallback) => styles.getPropertyValue(name).trim() || fallback

  return {
    // 정보 전달용: 축 숫자, 팀 이름, 범례, 툴팁 등 실제로 읽어야 하는 텍스트
    tick: get('--color-text-secondary', '#666666'),
    legend: get('--color-text-secondary', '#666666'),
    tooltipBg: get('--color-bg-card', '#f5f5f5'),
    tooltipBorder: get('--color-border', '#dddddd'),
    tooltipText: get('--color-text', '#1a1a1a'),

    // 장식/구조용: 그리드선, 기준선(baseline) 등 "있는지 몰라도 되는" 요소
    // 다크에서 배경(#1a1a1a) 대비 grid(#2a2a2a/#333)가 아주 살짝만 보이는 정도의
    // 대비를 라이트에서도 동일하게 재현 (진하게 만들지 않는다)
    gridSubtle: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    baselineSubtle: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
    highlightCursor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',

    // 보조 라벨 (예: 기준선의 "Q1" 텍스트) - 있으면 도움되지만 튀면 안 되는 라벨
    mutedLabel: get('--color-text-secondary', '#999999'),
  }
}

export function useChartTheme() {
  const [colors, setColors] = useState(readThemeColors)
  useEffect(() => {
    const target = document.documentElement
    const update = () => setColors(readThemeColors())
    const observer = new MutationObserver(update)
    observer.observe(target, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return colors
}
