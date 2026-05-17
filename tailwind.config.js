/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a202c",
        secondary: "#2d3748",
        accent: "#4fd1c5",
        "text-primary": "#edf2f7",
        "text-secondary": "#a0aec0",
      },
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
