/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'gone-black': '#000000',
                'gone-white': '#FFFFFF',
                'gone-gray': '#808080',
                'gone-light-gray': '#D3D3D3',
            },
        },
    },
    plugins: [],
}
