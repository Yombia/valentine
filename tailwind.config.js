/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'valentine-red': '#ff4d6d',
        'valentine-pink': '#ffb1b1',
      },
    },
  },
  plugins: [],
}