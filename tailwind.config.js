const palette = require('./src/constants/palette.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // palette.js(단일 소스) 기반. text/border는 Tailwind 유틸리티 접두사와 겹쳐 content/line으로 매핑.
      colors: {
        primary: palette.primary,
        'primary-light': palette.primaryLight,
        active: palette.active,
        inactive: palette.inactive,
        content: palette.text,
        'content-secondary': palette.textSecondary,
        'content-muted': palette.textMuted,
        background: palette.background,
        'background-secondary': palette.backgroundSecondary,
        line: palette.border,
        disabled: palette.disabled,
        error: palette.error,
        warning: palette.warning,
        success: palette.success,
      },
      spacing: {
        4.5: '18px',
      },
      minWidth: {
        4.5: '18px',
      },
    },
  },
  plugins: [],
};
