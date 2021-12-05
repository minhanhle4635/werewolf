module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  important: true,
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        'day-cover': "url('/src/img/day.jpg')",
        'night-cover': "url('/src/img/night.jpg')",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
