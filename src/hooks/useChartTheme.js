import { useState, useEffect } from 'react'

function readThemeColors() {
  const isDark = document.documentElement.classList.contains('dark')
  const styles = getComputedStyle(document.documentElement)
  const get = (name, fallback) => styles.getPropertyValue(name).trim() || fallback

  return {
    // 정보 전달용 텍스트: 진하게, 확실히 보이도록
    tick: get('--color-text', '#1a1a1a'),
    legend: get('--color-text', '#1a1a1a'),
    tooltipBg: get('--color-bg-card', '#f5f5f5'),
    tooltipBorder: get('--color-border', '#dddddd'),
    tooltipText: get('--color-text', '#1a1a1a'),
    mutedLabel: get('--color-text-secondary', '#666666'), // Q1 같은 보조 라벨만 이 정도

    // 장식용 그리드/기준선: 옅은 "실선"으로, 점선(dasharray) 사용 안 함
    gridSubtle: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    baselineSubtle: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)',

    // 유일하게 점선을 유지하는 "필요한 세로선" (쿼터 구분선)
    quarterDivider: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',

    highlightCursor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
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
