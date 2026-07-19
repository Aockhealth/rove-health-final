/** Rove Health design tokens — mirrors frontend/src/app/globals.css */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F6',
        'white-bone': '#FDFCFB',
        obsidian: '#1A1A1A',
        'phase-menstrual': '#AF6B6B',
        'phase-follicular': '#8DAA9D',
        'phase-ovulatory': '#D4A25F',
        'phase-luteal': '#7B82A8',
        'rove-red': '#AF6B6B',
        'rove-green': '#8DAA9D',
        'rove-cream': '#F9F9F5',
        'rove-stone': '#A8A29E',
        'rove-charcoal': '#2D2420',
        'rove-peach': '#F4DCD6',
        'rove-paper': '#FAF9F6',
        // New tracker tokens
        'dusty-rose': '#C97B7B',
        'dusty-rose-light': '#F5E8E8',
        'sage-teal': '#5B9A8B',
        'sage-teal-light': '#E0F0ED',
        'lavender-soft': '#7B82A8',
        'lavender-light': '#ECEEF5',
        'tracker-pink': '#F5D5D5',
        'tracker-green': '#D5EDE8',
        'tracker-gold': '#D4A25F',
      },
    },
  },
  plugins: [],
};
