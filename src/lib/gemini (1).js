// Llama a /api/generate-image (función serverless) — nunca a Gemini directo desde el navegador,
// para no exponer la API key.
export async function generarImagen({ prompt, formato, referenceImages, resolution }) {
  const res = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, formato, referenceImages, resolution }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error generando la imagen");
  return data.imageDataUrl;
}
