/** @type {import('tailwindcss').Config} */
const warmCompatibility = {
  50: '#FFF9F1',
  100: '#FFF9F1',
  200: '#E9B98A',
  300: '#E9B98A',
  400: '#D9825B',
  500: '#D9825B',
  600: '#33302D',
  700: '#33302D',
  800: '#33302D',
  900: '#33302D',
  950: '#33302D',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Cream + terracotta café palette. Legacy names remain aliases for existing components. */
        cream: {
          DEFAULT: '#FAF5ED',
          50: '#FFF9F1',
          100: '#FAF5ED',
          200: '#F4EAE0',
          300: '#EADFD3',
          400: '#E9B98A',
        },
        /* Warm terracotta scale, retained under the existing sage token name */
        sage: {
          DEFAULT: '#D9825B',
          50: '#FFF7F1',
          100: '#FCEADF',
          200: '#F4D2BE',
          300: '#E9B98A',
          400: '#E6A17C',
          500: '#D9825B',
          600: '#C66D49',
          700: '#A95638',
          800: '#81432F',
          900: '#5B3429',
          950: '#3F2923',
        },
        /* Charcoal neutrals, retained under the existing forest token name */
        forest: {
          DEFAULT: '#33302D',
          light: '#4A4540',
          dark: '#242220',
        },
        /* Soft peach highlights */
        softOrange: {
          DEFAULT: '#E9B98A',
          50: '#FFF9F1',
          100: '#F8E9D7',
          200: '#E9B98A',
          300: '#DDA875',
          400: '#D9825B',
          500: '#C66D49',
          600: '#A95638',
          700: '#81432F',
          800: '#5B3429',
          900: '#3F2923',
          950: '#2E211D',
        },
        primary: {
          DEFAULT: '#D9825B',
          50: '#FFF7F1',
          100: '#FCEADF',
          200: '#F4D2BE',
          300: '#E9B98A',
          400: '#E6A17C',
          500: '#D9825B',
          600: '#C66D49',
          700: '#A95638',
          800: '#81432F',
          900: '#5B3429',
          950: '#3F2923',
        },
        secondary: {
          DEFAULT: '#33302D',
          50: '#F8F5F1',
          100: '#EADFD3',
          200: '#D5C8BA',
          300: '#B6A99C',
          400: '#8C8178',
          500: '#655D56',
          600: '#4A4540',
          700: '#3D3935',
          800: '#33302D',
          900: '#242220',
        },
        accent: {
          DEFAULT: '#D9825B',
          50: '#FFF7F1',
          100: '#FCEADF',
          200: '#F4D2BE',
          300: '#E9B98A',
          400: '#D9825B',
          500: '#C66D49',
          600: '#A95638',
          700: '#81432F',
        },
        /* Warm aliases keep legacy status/validation classes inside the new palette. */
        rose: warmCompatibility,
        pink: warmCompatibility,
        red: warmCompatibility,
        emerald: warmCompatibility,
        green: warmCompatibility,
        blue: warmCompatibility,
        indigo: warmCompatibility,
        purple: warmCompatibility,
        amber: warmCompatibility,
        /* Semantic surface tokens */
        brandBg: {
          light: '#FAF5ED',
          dark: '#33302D',
        },
        brandCard: {
          light: '#FFFFFF',
          dark: '#403B36',
        },
        brandBorder: {
          light: '#EADFD3',
          dark: '#5A5048',
        },
        brandText: {
          primary: '#33302D',
          secondary: '#77716B',
          darkPrimary: '#FFF9F1',
          darkSecondary: '#D5C8BA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(51, 48, 45, 0.04), 0 2px 8px rgba(91, 52, 41, 0.04)',
        'soft': '0 5px 18px rgba(91, 52, 41, 0.08)',
        'elevated': '0 12px 34px rgba(51, 48, 45, 0.14)',
        'card': '0 1px 2px rgba(51, 48, 45, 0.04), 0 8px 24px -12px rgba(91, 52, 41, 0.18)',
        'card-hover': '0 3px 6px rgba(51, 48, 45, 0.05), 0 16px 34px -14px rgba(91, 52, 41, 0.22)',
        'glow': '0 0 0 4px rgba(217, 130, 91, 0.16)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '18px',
        '4xl': '24px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out both',
        slideUp: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) both',
        scaleIn: 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}
