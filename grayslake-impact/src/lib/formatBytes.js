/**
 * Bytes → "154 KB" / "7.1 MB".
 *
 * Lived inline in Sources.jsx while one page printed file sizes. The records
 * section prints them in three more places, and a second copy of a rounding
 * rule is how two pages start disagreeing about the size of the same file.
 */
export function formatBytes(bytes) {
  if (!bytes) return null
  const kb = bytes / 1024
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
}
