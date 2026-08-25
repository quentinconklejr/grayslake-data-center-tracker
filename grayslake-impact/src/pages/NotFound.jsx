import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <PageTitle title="Page Not Found" />
      <p className="text-xs font-mono text-ink-500 tracking-widest mb-3">404</p>
      <h1 className="text-3xl font-display text-ink-900 tracking-tight mb-3">Page not found</h1>
      <p className="text-base font-sans text-ink-600 max-w-xs mb-8 leading-relaxed">
        This page doesn&rsquo;t exist. Check the URL or head back to the tracker.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-3 border border-ink-900 text-ink-800 text-sm font-sans font-semibold hover:bg-paper-sunk transition-colors min-h-[44px]"
      >
        <span aria-hidden="true">←</span>
        Back to tracker
      </Link>
    </div>
  )
}
