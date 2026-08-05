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
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
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
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'xs':  ['12px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'sm':  ['14px', { lineHeight: '1.6' }],
        'base':['16px', { lineHeight: '1.75' }],
        'lg':  ['18px', { lineHeight: '1.65' }],
        'xl':  ['20px', { lineHeight: '1.5' }],
        '2xl': ['24px', { lineHeight: '1.35' }],
        '3xl': ['30px', { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        '4xl': ['36px', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        '5xl': ['48px', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        '6xl': ['60px', { lineHeight: '1.0',  letterSpacing: '-0.03em' }],
        '7xl': ['72px', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        '8xl': ['96px', { lineHeight: '0.9',  letterSpacing: '-0.04em' }],
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
