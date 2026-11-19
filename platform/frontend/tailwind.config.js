/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F7F3EA",
        sand: "#EFE9DC",
        mustard: "#F2C94C",
        "mustard-light": "#F7D979",
        charcoal: "#141413",
        "charcoal-hover": "#262624",
      },
    },
  },
  plugins: [],
};

