import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1226aa',
          50: '#e6eaf7',
          100: '#ccd5ef',
          200: '#99abdf',
          300: '#6681cf',
          400: '#3357bf',
          500: '#1226aa',
          600: '#0e1f88',
          700: '#0b1766',
          800: '#071044',
          900: '#040822',
        },
        secondary: {
          DEFAULT: '#e87200',
          50: '#fef3e6',
          100: '#fde7cc',
          200: '#fbcf99',
          300: '#f9b766',
          400: '#f79f33',
          500: '#e87200',
          600: '#ba5b00',
          700: '#8b4400',
          800: '#5d2e00',
          900: '#2e1700',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
