module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'login-bg': "url('@/assets/images/bg-login.jpg')",
      },
      colors: {
        primary: '#6C70E6',
      },
    },
  },
  plugins: [],
};
