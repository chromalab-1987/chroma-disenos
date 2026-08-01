// Vercel serverless function — corre en el servidor, nunca en el navegador.
// Necesita la variable de entorno GEMINI_API_KEY configurada en Vercel (Project Settings → Environment Variables).
//
// Modelo usado: gemini-3.1-flash-image-preview (línea "Nano Banana" de Gemini, buena relación
// costo/calidad para preview en baja resolución). Para la versión final en alta resolución se
// puede pasar model: "gemini-3-pro-image-preview" en el body si se necesita más calidad —
// conviene revisar el catálogo de modelos vigente en ai.google.dev antes de cambiarlo, porque
// Google renombra/deprecar modelos de imagen con frecuencia.

const ASPECT_RATIO_BY_FORMAT = {
  instagram: "1:1",
  linkedin: "16:9",
  post45: "3:4",
  story: "9:16",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { prompt, formato, referenceImages = [], resolution = "baja", model = "gemini-3.1-flash-image-preview" } = req.body;

  if (!prompt) return res.status(400).json({ error: "Falta el prompt" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY no configurada en el servidor" });

  const parts = [{ text: prompt }];

  // Imágenes de referencia del brand kit, como parte del mismo mensaje (hasta 14 soportadas por el modelo)
  for (const ref of referenceImages) {
    const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(ref);
    if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
  }

  const body = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      temperature: 1.3,
      imageConfig: {
        aspectRatio: ASPECT_RATIO_BY_FORMAT[formato] || "1:1",
        imageSize: resolution === "alta" ? "2K" : "1K",
      },
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Error de la API de Gemini" });
    }

    const imgPart = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!imgPart) return res.status(502).json({ error: "Gemini no devolvió una imagen" });

    const imageDataUrl = `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
    return res.status(200).json({ imageDataUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error al llamar a Gemini" });
  }
}
