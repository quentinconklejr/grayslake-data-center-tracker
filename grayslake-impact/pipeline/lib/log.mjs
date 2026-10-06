/**
 * Minimal structured logging. Warnings are always printed and also collected,
 * so a script can report them at the end (for example every chunked or
 * truncated input, which the owner asked to be warned about).
 */
const warnings = []

export const log = {
  info: (msg, data) => console.log(`[info] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`),
  warn: (msg, data) => {
    warnings.push({ at: new Date().toISOString(), msg, ...(data ?? {}) })
    console.warn(`[warn] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`)
  },
  error: (msg, data) => console.error(`[error] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`),
}

export function takeWarnings() {
  return warnings.splice(0)
}
