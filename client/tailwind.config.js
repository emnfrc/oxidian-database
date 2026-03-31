/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#0a0a0f',
          secondary: '#12101b',
          tertiary: '#1a1625',
          accent: '#7a5bb8',
          accentHover: '#6b4ea3',
          accentSoft: '#9d7bd8'
        }
      }
    },
  },
  plugins: [],
}
