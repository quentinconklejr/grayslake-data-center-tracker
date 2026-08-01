import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-xs font-mono text-blue-600/60 tracking-widest uppercase mb-3">404</p>
      <h1 className="text-2xl font-display font-semibold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm text-gray-500 max-w-xs mb-8">
        This page doesn't exist. Check the URL or head back to the tracker.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
      >
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
          <path fillRule="evenodd" d="M7.707 1.293a1 1 0 00-1.414 0l-6 6a1 1 0 000 1.414l6 6a1 1 0 001.414-1.414L3.414 9H14a1 1 0 000-2H3.414l4.293-4.293a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
        Back to tracker
      </Link>
    </div>
  )
}
