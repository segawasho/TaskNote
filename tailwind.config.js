module.exports = {
  content: [
    './app/javascript/**/*.{js,jsx,ts,tsx,css}',
  ],
  theme: {
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      lg: '15px',
      xl: '17px',
      '2xl': '19px',
    },
    extend: {
      fontFamily: {
        noto: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
