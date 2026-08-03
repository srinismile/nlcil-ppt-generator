// src/nlcBrandTheme.js
export const NLCIL_THEME = {
  companyName: "NLC India Limited",
  tagline: "CREATING WEALTH FOR WELLBEING",
  colors: {
    primaryBlue: "2E3092",
    darkBrown: "663333",
    maroon: "B20000",
    green: "009933",
    deepYellow: "FFCC00",
    textDark: "1A1A1A",
    textLight: "FFFFFF",
  },
  fonts: {
    title: "Arial",
    body: "Calibri",
  },
  rules: {
    maxBulletsPerSlide: 8,
    maxWordsPerBullet: 8,
  },
  // This automatically resolves to /nlcil-ppt-generator/logo.png on GitHub Pages
  logoUrl: `${import.meta.env.BASE_URL}logo.png`,
};