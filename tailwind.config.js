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
            'table-header-text': 'var(--table-header-text)',
            'table-footer': 'var(--table-footer)',
            'table-footer-text': 'var(--table-footer-text)',
            'text-primary': 'var(--text-primary)',
            'text-secondary': 'var(--text-secondary)',
            'sidebar-text-primary': 'var(--sidebar-text-primary)',
            'sidebar-text-secondary': 'var(--sidebar-text-secondary)',
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