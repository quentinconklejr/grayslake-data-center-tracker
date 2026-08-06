/*
 * DESIGN SYSTEM — T5 @ Chicago IV Impact Dashboard
 * ─────────────────────────────────────────────────
 * Typography:  Inter (display/headings/body, 400-700) · JetBrains Mono (data/labels, 400-500)
 *              Rule: mono ONLY for numbers, data labels, eyebrows, citations.
 *              All prose text uses Inter (both display and sans alias to Inter).
 *
 * Color:       Near-white slate base (#f8fafc). Text: #0f172a primary, slate-600/700 secondary.
 *              ONE accent: blue-600 (#2563eb) — used sparingly.
 *              Semantic: emerald = confirmed, amber = estimated, red = legal/opposition.
 *
 * Eyebrows:    2xs mono, uppercase, tracking-[0.2em], muted (whisper, not shout).
 * Cards:       .glass-card — white bg, slate border, subtle shadow. Hover lifts.
 * Motion:      Framer Motion — scroll fade/translate, count-ups, bounce scroll cue.
 */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Typefaces ────────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        sans:    ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },

      // ── Color palette ────────────────────────────────────────────────────────
      colors: {
        // Clean slate ramp — light, high-precision civic feel
        gray: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#64748b',
          500: '#4b5c72',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Sky-cobalt — the SINGLE confident accent
        blue: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        // Semantic: confirmed / sourced / positive
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Semantic: estimated / projected / caution / energy
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        violet: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        orange: {
          50:  '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          700: '#c2410c',
        },
        red: {
          50:  '#fef2f2',
          100: '#fee2e2',
          400: '#f87171',
          500: '#ef4444',
          700: '#b91c1c',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
      },

      // ── Opacity ──────────────────────────────────────────────────────────────
      opacity: {
        '96': '0.96',
        '98': '0.98',
      },

      // ── Type scale ────────────────────────────────────────────────────────────
      fontSize: {
        // The site was built almost entirely from 10px and 12px type: 151 uses
        // of 2xs and 96 of xs against 22 of base. Every size moves up a step so
        // the page reads at arm's length instead of asking the reader to squint.
        // Line heights loosen with it.
        '2xs':  ['12px',   { lineHeight: '1.5',  letterSpacing: '0.045em' }],
        'xs':   ['13.5px', { lineHeight: '1.6' }],
        'sm':   ['15px',   { lineHeight: '1.65' }],
        'base': ['17px',   { lineHeight: '1.7' }],
        'lg':   ['19px',   { lineHeight: '1.6' }],
        'xl':   ['22px',   { lineHeight: '1.45' }],
        '2xl':  ['28px',   { lineHeight: '1.3',  letterSpacing: '-0.01em' }],
        '3xl':  ['34px',   { lineHeight: '1.22', letterSpacing: '-0.015em' }],
        '4xl':  ['44px',   { lineHeight: '1.12', letterSpacing: '-0.022em' }],
        '5xl':  ['56px',   { lineHeight: '1.06', letterSpacing: '-0.028em' }],
        '6xl':  ['68px',   { lineHeight: '1.0',  letterSpacing: '-0.032em' }],
        '7xl':  ['84px',   { lineHeight: '0.96', letterSpacing: '-0.036em' }],
        '8xl':  ['104px',  { lineHeight: '0.92', letterSpacing: '-0.04em' }],
      },

      // ── Shadows ──────────────────────────────────────────────────────────────
      boxShadow: {
        // Glass-card shadows — light, precise, layered
        'glass':         '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        'glass-md':      '0 4px 6px rgba(15,23,42,0.07), 0 2px 4px rgba(15,23,42,0.05)',
        'glass-lg':      '0 10px 25px rgba(15,23,42,0.08), 0 4px 8px rgba(15,23,42,0.05)',
        'glass-hover':   '0 8px 20px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.06)',
        // Accent glow — used sparingly on key interactive elements
        'glow-accent':   '0 0 20px rgba(37,99,235,0.15), 0 0 4px rgba(37,99,235,0.08)',
        // Legacy names kept for backward compat
        'glow-sm':       '0 0 12px 2px rgba(37,99,235,0.10)',
        'glow':          '0 0 24px 4px rgba(37,99,235,0.12)',
        'glow-lg':       '0 0 48px 8px rgba(37,99,235,0.08)',
        'surface':       '0 1px 3px rgba(15,23,42,0.08), 0 4px 16px rgba(15,23,42,0.04)',
        'card':          '0 0 0 1px rgba(15,23,42,0.06), 0 2px 8px rgba(15,23,42,0.05)',
        'elevated':      '0 0 0 1px rgba(15,23,42,0.06), 0 8px 32px rgba(15,23,42,0.08)',
      },

      // ── Animation ────────────────────────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(5px)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'bounce-y':   'bounce-y 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
