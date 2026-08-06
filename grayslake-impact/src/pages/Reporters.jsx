import { Link } from 'react-router-dom'
import PageTitle from '../components/ui/PageTitle'
import { pageMeta } from '../data/pageMeta'
import FadeIn from '../components/ui/FadeIn'
import { FootnoteProvider, FootnoteList } from '../components/ui/FootnoteContext'
import { keyFigures } from '../data/keyFigures'
import KeyFigureList from '../components/ui/KeyFigureList'
import { contacts } from '../data/contacts'
import { LAST_VERIFIED } from '../data/siteConfig'
import AudienceBreadcrumb from '../components/ui/AudienceBreadcrumb'



export default function Reporters() {
  return (
    <FootnoteProvider>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <AudienceBreadcrumb current="Reporters" />
      <PageTitle {...pageMeta['/reporters']} />

      <FadeIn className="mb-10 pb-8 border-b border-gray-200">
        <p className="text-2xs font-mono text-blue-600/60 uppercase tracking-[0.2em] mb-3">Press Reference</p>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">Key figures and contacts</h1>
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          Sourced figures from public documents and press coverage on T5 @ Chicago IV.
          Every number links to its primary source. See{' '}
          <Link to="/documents" className="text-blue-600 hover:text-blue-700 transition-colors">the Documents page</Link>
          {' '}for full citation details.
        </p>
        <p className="text-2xs font-mono text-gray-400 mt-3">Last verified {LAST_VERIFIED}</p>
      </FadeIn>

      {/* Key figures — rendered from the canonical source, never retyped */}
      <FadeIn className="mb-14">
        <p className="text-2xs font-mono text-gray-600 uppercase tracking-widest mb-5">Key Figures</p>
        <KeyFigureList figures={keyFigures} copyable />
        <p className="text-xs text-gray-600 mt-3 leading-relaxed">
          Each figure is shown with the condition attached to it. Several are conditional or
          contested, and quoting the number without its qualifier will misstate the record.
          The copy button on each row puts the value, its condition and its citation on your
          clipboard together.
        </p>
      </FadeIn>

      {/* Contacts */}
      <FadeIn className="mb-14">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-2">Contacts</p>
        <p className="text-xs text-gray-500 mb-5">
          Contact information comes from source documents on file.
        </p>
        <div className="space-y-4">
          {contacts.map(c => (
            <div key={c.org} className="border border-gray-200 rounded-xl px-5 py-4 bg-white">
              <p className="text-sm font-display font-semibold text-gray-900">{c.org}</p>
              <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mt-0.5 mb-3">{c.role}</p>
              <div className="space-y-1.5">
                {c.website && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-gray-400 w-14 shrink-0 font-mono">web</span>
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {c.website}
                    </a>
                  </div>
                )}
              </div>
              {c.note && (
                <p className="text-xs text-amber-700/80 italic mt-3 leading-relaxed border-t border-gray-100 pt-3">
                  {c.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Note on coverage */}
      <FadeIn className="border-t border-gray-200 pt-8">
        <p className="text-2xs font-mono text-gray-400 uppercase tracking-widest mb-3">Coverage on File</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          This site indexes primary reporting from the Daily Herald, Chicago Tribune, Data Center Dynamics,
          Government Technology, Capitol News Illinois, Chronicle Media, Patch, and Hoodline,
          as well as official documents from the Village of Grayslake, Village of Mundelein,
          Citizens Utility Board, Alliance for the Great Lakes, and Illinois DCEO.
        </p>
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all documents and sources
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </FadeIn>

      <FootnoteList />
    </div>
    </FootnoteProvider>
  )
}
