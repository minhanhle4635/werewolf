module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  important: true,
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        'homepage-cover': "url('/src/img/cover.jpg')",
        'lobby-cover': "url('/src/img/lobby_cover.jpg')",
        'create-room-cover': "url('/src/img/create_room_cover.jpg')",
        'profile-cover': "url('/src/img/profile_cover.jpg')",
        'phase-night': "url('/src/img/night.jpg')",
        'phase-day': "url('/src/img/day.jpg')",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
