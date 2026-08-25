/** @type {import('tailwindcss').Config} */

/*
 * Design tokens for the Grayslake Data Center Tracker.
 *
 * The site is meant to read as a civic records archive — a county
 * assessor's published report, not a SaaS dashboard. Every token below
 * exists so the same rule is enforced across every component. If you're
 * about to reach for a raw slate-/gray-/sky- utility, that's the signal
 * to add a semantic token here instead.
 *
 * Palette layers
 * ──────────────
 *   ink      Foreground text. 900 is the near-black used for headlines
 *            and important figures; 700 is body copy; 500/400 are
 *            captions, timestamps, and other metadata.
 *   paper    Backgrounds. DEFAULT is the warm off-white page ground.
 *            .raised is pure white for the tightly-scoped "one elevated
 *            surface" exceptions (map popup, mobile menu). .sunk is a
 *            slightly darker tint for zebra rows and quiet callouts.
 *   rule     Hairlines. Everything the old design accomplished with a
 *            card-and-shadow now does with a rule.
 *   accent   The one interactive-only accent. Deep newsprint blue —
 *            traditional, non-partisan, reads as "government publication"
 *            rather than "tech product". Used for links, active nav,
 *            focus rings, and a small handful of controls. NEVER for
 *            decorative typography or category encoding.
 *   status   Low-chroma semantic hues reserved for status/category
 *            encoding on the parcel map, EvidenceBlock, Timeline, and
 *            Actions filters. Each hue exists as a DEFAULT (ink weight
 *            for text/borders) and .soft (tint for backgrounds). Applied
 *            like a rubber stamp, not like a traffic light.
 *
 * The blue/emerald/amber/violet families defined below are legacy — they
 * exist so lingering utility-class references in un-refactored components
 * continue to render. The purge pass at the end of the refactor removes
 * every use, at which point these families can be deleted.
 */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Editorial headline face — variable Fraunces with opsz axis.
        // Fallback to a system serif so the shape and colour of headlines
        // approximates the loaded face before it arrives.
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        // Workhorse text face. IBM Plex Sans reads as institutional but
        // not corporate; the fallback stack is what most systems paint if
        // the woff2 hasn't landed yet.
        sans:    ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'system-ui', 'sans-serif'],
        // Data face. Reserved for parcel IDs, dates, coordinates, dollar
        // figures — never for decorative labels.
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },

      colors: {
        // Foreground text ─────────────────────────────────────────────
        ink: {
          DEFAULT: '#14110f', // 900 — headlines, key figures
          900: '#14110f',
          800: '#26221e',
          700: '#3d372f', // default body text
          600: '#55504a', // secondary text, block quotes
          500: '#75706a', // muted — captions, meta, source lines
          400: '#9a9590', // subtle — labels, disabled
        },

        // Backgrounds ─────────────────────────────────────────────────
        paper: {
          DEFAULT: '#faf8f4', // warm off-white page ground
          raised:  '#ffffff', // narrowly scoped elevation
          sunk:    '#f0ecdf', // subtle tint — zebra, quiet callouts
        },

        // Hairlines ───────────────────────────────────────────────────
        rule: {
          DEFAULT: '#c8bfb0', // visible hairline
          soft:    '#e6dfd0', // barely-there separator
          strong:  '#8a7f6f', // emphasized rule
        },

        // Interactive accent ──────────────────────────────────────────
        accent: {
          DEFAULT: '#1e3a5f', // deep newsprint blue
          hover:   '#142944', // darker for hover state
          soft:    '#eaeef4', // tinted background (hover fill, chips)
        },

        // Status hues ─────────────────────────────────────────────────
        // Text/border tone and matching soft background tint. Muted on
        // purpose — they should read as classification, not alert.
        status: {
          stated:       { DEFAULT: '#2f6f4a', soft: '#e6f0e6' },
          disputed:     { DEFAULT: '#8a5a1a', soft: '#f4ecd7' },
          unknown:      { DEFAULT: '#6b6055', soft: '#ede7db' },
          approval:     { DEFAULT: '#234b7a', soft: '#e2e9f2' },
          construction: { DEFAULT: '#2f6f4a', soft: '#e6f0e6' },
          opposition:   { DEFAULT: '#8a5a1a', soft: '#f4ecd7' },
          legal:        { DEFAULT: '#8a2820', soft: '#f2dfdc' },
          development:  { DEFAULT: '#2b5f6b', soft: '#dee9ec' },
          policy:       { DEFAULT: '#7a5510', soft: '#f0e6cf' },
        },

        // Legacy families — kept until every raw utility use is purged.
        // Do not add new usages. paper/ink/rule/accent/status above are
        // the tokens the design system speaks in.
        edge: {
          DEFAULT: '#c8bfb0',
          soft:    '#e6dfd0',
        },
        blue: {
          50:  '#eaeef4',
          100: '#dbeafe',
          600: '#1e3a5f',
          700: '#142944',
          800: '#0e1e33',
        },
        emerald: {
          50:  '#e6f0e6',
          100: '#d1fae5',
          600: '#2f6f4a',
          700: '#245a3b',
        },
        amber: {
          50:  '#f4ecd7',
          100: '#fef3c7',
          600: '#8a5a1a',
          700: '#6f4914',
        },
        violet: {
          50:  '#eee6f0',
          100: '#ede9fe',
          600: '#5a3a7a',
          700: '#48305f',
        },
      },

      borderRadius: {
        // Named radius tokens the new system uses. Cards no longer have
        // corners — anything that survives with radius is a chip, button,
        // input, or the narrow overlay exceptions.
        edge: '2px',
        chip: '3px',
      },

      fontSize: {
        // Editorial scale. Every use of arbitrary text-[Npx] in the
        // component code should map to one of these.
        '2xs':  ['12.5px', { lineHeight: '1.5',  letterSpacing: '0.01em' }],
        'xs':   ['14px',   { lineHeight: '1.6' }],
        'sm':   ['15px',   { lineHeight: '1.6' }],
        'base': ['17px',   { lineHeight: '1.65' }],
        'lg':   ['19px',   { lineHeight: '1.55' }],
        'xl':   ['22px',   { lineHeight: '1.4' }],
        '2xl':  ['28px',   { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        '3xl':  ['36px',   { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        '4xl':  ['46px',   { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        '5xl':  ['60px',   { lineHeight: '1.02', letterSpacing: '-0.03em' }],
      },
    },
  },
  plugins: [],
}
