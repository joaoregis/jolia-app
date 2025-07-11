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
            sidebar: 'var(--sidebar)',
            card: 'var(--card)',
            'table-header': 'var(--table-header)',
            'text-primary': 'var(--text-primary)',
            'text-secondary': 'var(--text-secondary)',
            border: 'var(--border)',
            accent: {
                DEFAULT: 'var(--accent)',
                hover: 'var(--accent-hover)',
            },
        }
    },
  },
  plugins: [],
}