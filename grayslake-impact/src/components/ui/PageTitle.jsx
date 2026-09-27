import { useEffect } from 'react'

const BASE_TITLE = 'Grayslake Data Center Tracker'
const SUFFIX = ' | Grayslake Data Center Tracker'
// A title that already starts with the site name skips the suffix, so it
// does not say "Grayslake Data Center" twice.
const withSuffix = title => (title.startsWith('Grayslake Data Center') ? title : `${title}${SUFFIX}`)
const CANONICAL_ORIGIN = 'https://grayslakedatacentertracker.org'

function absolute(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  const origin = typeof window !== 'undefined' && window.location.origin.startsWith('http') 
    ? window.location.origin 
    : CANONICAL_ORIGIN
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`
}

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

export default function PageTitle({ title, description, ogImage }) {
  const fullTitle = title ? withSuffix(title) : BASE_TITLE

  useEffect(() => {
    const prev = document.title
    document.title = fullTitle

    if (description) {
      const url = window.location.origin + window.location.pathname
      upsertMeta('name', 'description', description)
      upsertLink('canonical', CANONICAL_ORIGIN + window.location.pathname)
      
      // OpenGraph Meta Tags
      upsertMeta('property', 'og:title', fullTitle)
      upsertMeta('property', 'og:description', description)
      upsertMeta('property', 'og:url', url)
      upsertMeta('property', 'og:type', 'website')

      const ogImageUrl = absolute(ogImage)
      if (ogImageUrl) {
        upsertMeta('property', 'og:image', ogImageUrl)
        upsertMeta('property', 'og:image:width', '1200')
        upsertMeta('property', 'og:image:height', '630')
      }

      // Twitter Card Meta Tags
      upsertMeta('name', 'twitter:card', 'summary_large_image')
      upsertMeta('name', 'twitter:title', fullTitle)
      upsertMeta('name', 'twitter:description', description)
      if (ogImageUrl) upsertMeta('name', 'twitter:image', ogImageUrl)
    }

    return () => {
      document.title = prev
    }
  }, [fullTitle, description, ogImage])

  return null
}
