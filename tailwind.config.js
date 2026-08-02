module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 100%, 55%)',
        secondary: 'hsl(260, 80%, 60%)',
        glass: 'rgba(255,255,255,0.3)'
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
      }
    }
  },
  plugins: []
};
