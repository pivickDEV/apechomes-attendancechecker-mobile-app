/** @type {import('tailwindcss').Config} */

module.exports = {
  important: true, // Ensures Tailwind classes take priority
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"], // Scans these files for Tailwind usage
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'], // Add Montserrat font
      },
    },
  },
  plugins: [],
};