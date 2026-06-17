import { useEffect } from 'react'

const BASE = 'T5 @ Chicago IV — Grayslake Community Impact'

export default function PageTitle({ title }) {
  useEffect(() => {
    document.title = title ? `${title} — T5 @ Chicago IV` : BASE
    return () => { document.title = BASE }
  }, [title])
  return null
}
