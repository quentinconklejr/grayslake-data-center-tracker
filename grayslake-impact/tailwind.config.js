/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Modern, sleek tech display stack (Inter / System UI)
        display: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        sans:    ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#fcfcfc',
          subtle:  '#f8fafc',
          card:    '#ffffff',
        },
        edge: {
          DEFAULT: '#cbd5e1',
          soft:    '#e2e8f0',
        },
        // High-contrast modern ink ramp
        ink: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        },
        // Purposeful accent colors
        blue: {
          50:  '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
        },
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          600: '#059669',
          700: '#047857',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          600: '#d97706',
          700: '#b45309',
        },
        violet: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
      fontSize: {
        '2xs':  ['13px',   { lineHeight: '1.5',  letterSpacing: '0.02em' }],
        'xs':   ['14.5px', { lineHeight: '1.6' }],
        'sm':   ['15.5px', { lineHeight: '1.65' }],
        'base': ['17px',   { lineHeight: '1.7' }],
        'lg':   ['19px',   { lineHeight: '1.6' }],
        'xl':   ['22px',   { lineHeight: '1.45' }],
        '2xl':  ['28px',   { lineHeight: '1.3',  letterSpacing: '-0.02em' }],
        '3xl':  ['34px',   { lineHeight: '1.2',  letterSpacing: '-0.025em' }],
        '4xl':  ['44px',   { lineHeight: '1.1',  letterSpacing: '-0.03em' }],
        '5xl':  ['56px',   { lineHeight: '1.05', letterSpacing: '-0.035em' }],
      },
    },
  },
  plugins: [],
}
