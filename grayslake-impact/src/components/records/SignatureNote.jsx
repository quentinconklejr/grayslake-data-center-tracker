import PageCite from './PageCite'

/*
 * The signature-gap note.
 *
 * Three documents in the packet carry a Village signature and a blank set of
 * T5 signature lines. That is a fact about this copy of these pages and
 * nothing more, so the wording below is fixed: it states what the page shows,
 * states the effective-date clause the ordinance itself sets out, states the
 * obvious innocent explanation, and says what has been asked. It draws no
 * conclusion about whether the approvals are valid, because the packet does
 * not support one.
 *
 * It is a quiet block on the ordinance page, not a banner, and it is kept out
 * of every headline, summary box and social preview on the site.
 */
export default function SignatureNote({ file, documentName, packetPage, villageSignedOn }) {
  return (
    <div className="border-l-2 border-rule-strong pl-4 sm:pl-5 py-1">
      <p className="text-sm font-sans text-ink-700 leading-relaxed">
        In the copy of this packet we received, the signature lines for T5@CHICAGO IV LP on the{' '}
        {documentName} are blank (<PageCite file={file} page={packetPage} className="text-sm" />).
        The Village signed on {villageSignedOn}. The ordinance states it takes effect once the
        Village receives the signed agreement from the developer. T5 may have signed a separate copy
        that was not included in this packet. We have asked the Village for any T5-signed copies and
        will update this page with the answer.
      </p>
    </div>
  )
}
