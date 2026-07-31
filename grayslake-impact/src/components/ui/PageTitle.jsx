import { useEffect } from 'react'

const BASE = 'Grayslake Data Center Tracker'

export default function PageTitle({ title }) {
  useEffect(() => {
    document.title = title ? `${title} — Grayslake Data Center Tracker` : BASE
    return () => { document.title = BASE }
  }, [title])
  return null
}
