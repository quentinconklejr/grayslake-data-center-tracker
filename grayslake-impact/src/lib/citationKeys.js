// Normalises the two evidence-item citation shapes into one list.
// Kept out of the component file so that module only exports components
// (react-refresh/only-export-components).
export function keysOf(item) {
  if (!item) return []
  const keys = []
  if (item.sourceKey) keys.push(item.sourceKey)
  for (const k of item.sourceKeys ?? []) {
    if (!keys.includes(k)) keys.push(k)
  }
  return keys
}
