/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            background: 'var(--background)',
            card: 'var(--card)',
            'text-primary': 'var(--text-primary)',
            'text-secondary': 'var(--text-secondary)',
            'border-color': 'var(--border-color)',
            accent: {
                DEFAULT: 'var(--accent)',
                hover: 'var(--accent-hover)',
            },
        }
    },
  },
  plugins: [],
}
