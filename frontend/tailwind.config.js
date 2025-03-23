const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ Include your components
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}", // ✅ Ensure Flowbite components are scanned
    "node_modules/flowbite/**/*.{js,jsx,ts,tsx}"
    
  ],
  theme: {
    extend: {
      colors: {
        brandPrimary: "#4CAF4F",
      },
    },
  },
  plugins: [flowbite.plugin()],
};