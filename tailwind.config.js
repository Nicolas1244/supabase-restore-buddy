/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      // Ajout de la propriété transitionProperty pour permettre la transition sur 'transform'
      transitionProperty: {
        'transform': 'transform',
      },
      transitionDuration: {
        '300': '300ms', // Durée de transition pour la fluidité
      },
      transitionTimingFunction: {
        'ease-in-out': 'ease-in-out', // Fonction de timing pour la fluidité
      },
    },
  },
  plugins: [],
}
