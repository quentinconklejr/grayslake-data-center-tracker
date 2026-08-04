import { useEffect } from 'react'

const BASE_TITLE = 'Grayslake Data Center Tracker'
const SUFFIX = ' | T5@Chicago Tracker'
const OG_SITE_NAME = 'T5@Chicago Impact Tracker'

function upsertMeta(attrName, attrVal, content) {
  let el = document.querySelector(`meta[${attrName}="${attrVal}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrVal)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// title: page-specific label (omit on home to use BASE_TITLE without suffix)
// description: one-sentence page summary for <meta name="description"> and OG
// ogImage: path to OG image, e.g. "/og/timeline.png"
export default function PageTitle({ title, description, ogImage }) {
  const fullTitle = title ? `${title}${SUFFIX}` : BASE_TITLE

  useEffect(() => {
    const prev = document.title
    document.title = fullTitle

    if (description) {
      const url = window.location.origin + window.location.pathname

      upsertMeta('name', 'description', description)
      upsertLink('canonical', url)
      upsertMeta('property', 'og:title', fullTitle)
      upsertMeta('property', 'og:description', description)
      upsertMeta('property', 'og:url', url)
      upsertMeta('property', 'og:type', 'website')
      upsertMeta('property', 'og:site_name', OG_SITE_NAME)
      if (ogImage) upsertMeta('property', 'og:image', ogImage)
      upsertMeta('name', 'twitter:card', 'summary_large_image')
      upsertMeta('name', 'twitter:title', fullTitle)
      upsertMeta('name', 'twitter:description', description)
      if (ogImage) upsertMeta('name', 'twitter:image', ogImage)
    }

    return () => { document.title = prev }
  }, [fullTitle, description, ogImage])

  return null
}
