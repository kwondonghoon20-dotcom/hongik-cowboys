// 빌드 시 src/data/touchdownRoutes/*.json 을 전부 읽어
// {gameKey}__{clipKey} 키로 조회 가능하게 만든다.
const _files = import.meta.glob('./touchdownRoutes/*.json', { eager: true })

const _routesByKey = {}
for (const mod of Object.values(_files)) {
  const data = mod.default ?? mod
  if (data?.gameKey && data?.clipKey != null) {
    _routesByKey[`${data.gameKey}__${String(data.clipKey)}`] = data
  }
}

export function getTouchdownRoute(gameKey, clipKey) {
  if (!gameKey || clipKey == null) return null
  return _routesByKey[`${gameKey}__${String(clipKey)}`] ?? null
}
