/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      '2xs': '360px',
      'xs': '410px',
      'sm': '500px',
      'md': '600px',
      'lg': '768px',
      'xl': '1024px',
      '2xl': '1280px',
    },
    extend: {
      boxShadow: {
        inv: '0 1px 10px #161616',
        default: '0 3px 10px #787878',
        btn: 'inset 0.2rem -0.6rem 0.2rem -0.15rem #a1a1a15a',
        emboss: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 2px rgba(0,0,0,0.3), 0 0 4px 1px rgba(0,0,0,0.2), inset 0 3px 2px rgba(255,255,255,.22), inset 0 -3px 2px rgba(0,0,0,.15), inset 0 20px 10px rgba(255,255,255,.12), 0 0 4px 1px rgba(0,0,0,.1), 0 3px 2px rgba(0,0,0,.2)',
      },
      zIndex: {
        '-1': '-1',
      },
      textShadow: {
        eng: 'rgba(245,245,245,0.5) 3px 5px 1px',
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
      fontSize: {
        '3xs': ['0.5rem', '0.75rem'],
        '2xs': ['0.625rem', '1rem'],
      },
      fontFamily: {
        yellowtail: 'Yellowtail',
        varela: 'Varela Round',
        barlow: 'Barlow Condensed',
        oswald: 'Oswald Variable',
      },
      translate: {
        navbarActive: '-8px',
        navbarActiveLg: '-4px',
      },
      keyframes: {
        btnClick: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.85)" }
        },
        toggleClick: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.9)" }
        },
      },
      animation: {
        btnClick: "btnClick 150ms ease-in-out",
        toggleClick: "toggleClick 75ms ease-in-out",
      },
      colors: {
        hotel: {
          50: "#ffdfd8",
          100: "#ffc2bc",
          200: "#ffa7a1",
          300: "#eb8c87",
          400: "#cd716d",
          500: "#b05855",
          600: "#933f3e",
          700: "#772628",
          800: "#5b0a14",
          900: "#410000",
        },
        sunview: {
          50: "#c7e8ff",
          100: "#abccff",
          200: "#8eb1f1",
          300: "#7396d4",
          400: "#577cb8",
          500: "#3b649d",
          600: "#1a4c83",
          700: "#00366a",
          800: "#002151",
          900: "#00093a",
        },
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
      },
      gridTemplateColumns: {
        'skaterStatTable': `minmax(35px, 1fr) minmax(50px, 1fr) minmax(30px, 1fr) repeat(8, minmax(25px, 1fr)) minmax(35px, 1fr)`,
        'goalieStatTable': `minmax(35px, 1fr) minmax(68px, 1fr) minmax(50px, 1fr) minmax(20px, 1fr) minmax(20px, 1fr) repeat(3, minmax(30px, 1fr))`,
        '12': `repeat(12, minmax(0, 1fr))`,
        '13': `repeat(13, minmax(0, 1fr))`,
        '14': `repeat(14, minmax(0, 1fr))`,
        '15': `repeat(15, minmax(0, 1fr))`,
        '16': `repeat(16, minmax(0, 1fr))`,
        '17': `repeat(17, minmax(0, 1fr))`,
        '18': `repeat(18, minmax(0, 1fr))`,
        '19': `repeat(19, minmax(0, 1fr))`,
        '20': `repeat(20, minmax(0, 1fr))`,
      }
    },
  },
  plugins: [],
}


