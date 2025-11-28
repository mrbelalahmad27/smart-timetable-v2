/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--color-background)',
                card: 'var(--color-card)',
                cardLight: 'var(--color-card-light)',
                accent: 'var(--color-accent)',
                textMain: '#ffffff',
                textMuted: '#9ca3af',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
