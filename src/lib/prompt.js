import { FORMATS } from "./store.js";

const ESTILOS = {
  minimalista: "Composición minimalista: mucho espacio vacío, un solo elemento visual protagonista, formas simples.",
  bold: "Composición bold: colores de acento protagonistas, formas grandes, alto contraste.",
  editorial: "Composición editorial tipo revista: capas, texturas o elementos gráficos sutiles de fondo.",
};

// Arma el prompt de texto que se le va a enviar a Gemini para un estilo puntual (uno de los 3).
export function buildPrompt({ brandKit, project, estiloKey }) {
  const fmt = FORMATS[project.formato];
  const lines = [];

  lines.push(`Genera una imagen de diseño gráfico en formato ${fmt.label} (${fmt.w}x${fmt.h}px).`);
  lines.push(ESTILOS[estiloKey]);

  lines.push(
    `Paleta de colores a usar exactamente: primario ${brandKit.paleta.primario}, secundario ${brandKit.paleta.secundario}, acento ${brandKit.paleta.acento}, fondo ${brandKit.paleta.fondo}.`
  );

  lines.push(
    `Estilo tipográfico de referencia: título con look "${brandKit.fontTitulo}", cuerpo con look "${brandKit.fontCuerpo}" (aproximar el carácter visual de estas fuentes).`
  );

  if (brandKit.referencias.length > 0) {
    lines.push("Imágenes de referencia de estilo adjuntas, con notas del cliente sobre qué le gusta de cada una:");
    brandKit.referencias.forEach((r, i) => {
      lines.push(`  Referencia ${i + 1}: ${r.nota || "(sin nota, usar solo como guía visual)"}`);
    });
  }

  if (project.modoEntrada === "copy") {
    lines.push(`Contenido/copy a comunicar visualmente: "${project.copyTexto}"`);
  } else {
    lines.push(`Idea/estilo pedido por el cliente: "${project.promptLibre}"`);
  }

  if (project.ajustesExtra?.trim()) {
    lines.push(`Ajustes puntuales para este diseño: ${project.ajustesExtra}`);
  }

  if (project.modoGeneracion === "A") {
    lines.push(
      "IMPORTANTE: no renderizar ningún texto dentro de la imagen. Generar solo el fondo/composición visual, dejando una zona limpia y de bajo contraste donde después se va a sobreponer el texto real con edición manual. No incluir logo."
    );
  } else {
    lines.push(
      `IMPORTANTE: incluir el texto del copy renderizado de forma legible dentro de la imagen, con jerarquía clara (título más grande, cuerpo/CTA más chico), y dejar espacio en la esquina "${brandKit.logoPos.corner}" para un logo (tamaño ${brandKit.logoPos.size}).`
    );
  }

  return lines.join("\n");
}
