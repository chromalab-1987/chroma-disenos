// Lista curada de Google Fonts. "cssFamily" es el valor listo para usar en font-family.
// El link de carga real de cada familia se arma dinámicamente en GoogleFontLoader.

export const TITLE_FONTS = [
  { name: "Fraunces", cssFamily: "'Fraunces', serif", googleParam: "Fraunces:wght@500;600" },
  { name: "Playfair Display", cssFamily: "'Playfair Display', serif", googleParam: "Playfair+Display:wght@600;700" },
  { name: "Space Grotesk", cssFamily: "'Space Grotesk', sans-serif", googleParam: "Space+Grotesk:wght@500;700" },
  { name: "Bebas Neue", cssFamily: "'Bebas Neue', sans-serif", googleParam: "Bebas+Neue" },
  { name: "DM Serif Display", cssFamily: "'DM Serif Display', serif", googleParam: "DM+Serif+Display" },
  { name: "Archivo Black", cssFamily: "'Archivo Black', sans-serif", googleParam: "Archivo+Black" },
  { name: "Cormorant Garamond", cssFamily: "'Cormorant Garamond', serif", googleParam: "Cormorant+Garamond:wght@600;700" },
];

export const BODY_FONTS = [
  { name: "Inter", cssFamily: "'Inter', sans-serif", googleParam: "Inter:wght@400;500" },
  { name: "IBM Plex Sans", cssFamily: "'IBM Plex Sans', sans-serif", googleParam: "IBM+Plex+Sans:wght@400;500" },
  { name: "Work Sans", cssFamily: "'Work Sans', sans-serif", googleParam: "Work+Sans:wght@400;500" },
  { name: "Source Serif 4", cssFamily: "'Source Serif 4', serif", googleParam: "Source+Serif+4:wght@400;500" },
  { name: "Manrope", cssFamily: "'Manrope', sans-serif", googleParam: "Manrope:wght@400;500" },
  { name: "Nunito Sans", cssFamily: "'Nunito Sans', sans-serif", googleParam: "Nunito+Sans:wght@400;500" },
];

const ALL_FONTS = [...TITLE_FONTS, ...BODY_FONTS];

export function findFont(name) {
  return ALL_FONTS.find((f) => f.name === name);
}

const loaded = new Set();

// Inyecta el <link> de Google Fonts para una familia bajo demanda (para previews).
export function ensureFontLoaded(name) {
  const font = findFont(name);
  if (!font || loaded.has(font.name)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleParam}&display=swap`;
  document.head.appendChild(link);
  loaded.add(font.name);
}
