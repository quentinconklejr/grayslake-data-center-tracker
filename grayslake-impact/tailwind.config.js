/*
 * DESIGN SYSTEM — T5 @ Chicago IV Impact Dashboard
 * ─────────────────────────────────────────────────
 * Typography:  Montserrat (display/headings, 600-800) · Open Sans (body/UI, 400-600) · Roboto Mono (data/labels)
 *              Rule: mono ONLY for numbers, data labels, eyebrows, citations.
 *              All prose text uses the sans family.
 *
 * Color:       Near-white base (#f2f2f8). Text: #111111 primary, gray-600/700 secondary.
 *              ONE accent: blue-600 (#0284c7) — used sparingly.
 *              Semantic: emerald = confirmed, amber = estimated, red = legal/opposition.
 *
 * Eyebrows:    2xs mono, uppercase, tracking-[0.2em], muted (whisper, not shout).
 * Motion:      Framer Motion — scroll fade/translate, count-ups, bounce scroll cue.
 */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Typefaces ────────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Montserrat"', 'system-ui', 'sans-serif'],
        sans:    ['"Open Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"Roboto Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },

      // ── Color palette ────────────────────────────────────────────────────────
      colors: {
        // Violet-tinted charcoal ramp
        gray: {
          50:  '#f2f2f8',
          100: '#e3e3ef',
          200: '#c5c5df',
          300: '#9898c4',
          400: '#6b6ba0',
          500: '#52527c',
          600: '#3d3d5e',
          700: '#2c2c45',
          800: '#1e1e33',
          900: '#11111f',
          950: '#090910',
        },
        // Sky-cobalt — the SINGLE confident accent
        blue: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        // Semantic: confirmed / sourced / positive
        emerald: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Semantic: estimated / projected / caution / energy
        amber: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
        },
        red: {
          400: '#f87171',
          500: '#ef4444',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
      },

      // ── Type scale ────────────────────────────────────────────────────────────
      // base=18px (body), 2xl=28px (section h2), 4xl=42px (page h1)
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'xs':  ['13px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'sm':  ['15px', { lineHeight: '1.6' }],
        'base':['18px', { lineHeight: '1.75' }],
        'lg':  ['20px', { lineHeight: '1.65' }],
        'xl':  ['22px', { lineHeight: '1.5' }],
        '2xl': ['28px', { lineHeight: '1.3' }],
        '3xl': ['34px', { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        '4xl': ['42px', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        '5xl': ['52px', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        '6xl': ['64px', { lineHeight: '1.0',  letterSpacing: '-0.03em' }],
        '7xl': ['80px', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        '8xl': ['96px', { lineHeight: '0.9',  letterSpacing: '-0.04em' }],
      },

      // ── Shadows ──────────────────────────────────────────────────────────────
      boxShadow: {
        'glow-sm':  '0 0 12px 2px rgba(14,165,233,0.15)',
        'glow':     '0 0 24px 4px rgba(14,165,233,0.18)',
        'glow-lg':  '0 0 48px 8px rgba(14,165,233,0.12)',
        'surface':  '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)',
        'card':     '0 0 0 1px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.3)',
        'elevated': '0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)',
      },

      // ── Animation ────────────────────────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(6px)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'bounce-y':   'bounce-y 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
