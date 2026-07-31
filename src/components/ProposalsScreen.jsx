import { useState, useEffect } from "react";
import { generarImagen } from "../lib/gemini.js";
import { MAX_TANDAS, COSTO_ESTIMADO } from "../lib/store.js";

const ESTILOS = ["minimalista", "bold", "editorial"];
const ESTILO_LABEL = { minimalista: "Minimalista", bold: "Bold", editorial: "Editorial" };

export default function ProposalsScreen({ client, project, onDone, onCancel }) {
  const [proyecto, setProyecto] = useState(project);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (proyecto.propuestas.length === 0) generarTanda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const referenceImages = client.brandKit.referencias.map((r) => r.image);

  const generarTanda = async () => {
    setGenerating(true);
    setError(null);
    try {
      const propuestas = await Promise.all(
        ESTILOS.map(async (estilo) => ({
          id: `${Date.now()}${estilo}`,
          estilo,
          imagenUrl: await generarImagen({
            prompt: proyecto.promptsPorEstilo[estilo],
            formato: proyecto.formato,
            referenceImages,
            resolution: "baja",
          }),
        }))
      );
      setProyecto((p) => ({
        ...p,
        propuestas,
        tandas: p.tandas + 1,
        gastoAcumulado: p.gastoAcumulado + propuestas.length * COSTO_ESTIMADO.baja,
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const elegirPropuesta = async (propuesta) => {
    setGenerating(true);
    setError(null);
    try {
      const imagenFinal = await generarImagen({
        prompt: proyecto.promptsPorEstilo[propuesta.estilo],
        formato: proyecto.formato,
        referenceImages,
        resolution: "alta",
      });
      const actualizado = {
        ...proyecto,
        propuestaElegidaId: propuesta.id,
        disenoFinal: imagenFinal,
        estado: "en revision",
        gastoAcumulado: proyecto.gastoAcumulado + COSTO_ESTIMADO.alta,
      };
      setProyecto(actualizado);
      onDone(actualizado);
    } catch (e) {
      setError(e.message);
      setGenerating(false);
    }
  };

  const puedeRegenerar = proyecto.tandas < MAX_TANDAS;

  return (
    <div>
      <div className="eyebrow">Propuestas · {client.name}</div>
      <h1 className="page-title">Elegí un estilo</h1>
      <p className="page-sub">
        Tanda {proyecto.tandas} de {MAX_TANDAS} · gasto acumulado en este proyecto: ${proyecto.gastoAcumulado.toFixed(2)}
      </p>

      {error && (
        <div className="card" style={{ borderColor: "var(--danger)", color: "var(--danger)", marginBottom: 20, fontSize: 13 }}>
          {error}. Revisá que <code>GEMINI_API_KEY</code> esté configurada en el servidor.
        </div>
      )}

      <div className="client-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {generating && proyecto.propuestas.length === 0 &&
          ESTILOS.map((estilo) => (
            <div key={estilo} className="card" style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Generando {ESTILO_LABEL[estilo]}…
            </div>
          ))}

        {proyecto.propuestas.map((p) => (
          <div key={p.id} className="card" style={{ padding: 12 }}>
            <img src={p.imagenUrl} alt={p.estilo} style={{ width: "100%", borderRadius: 8, display: "block", marginBottom: 10 }} />
            <p className="client-name" style={{ fontSize: 14 }}>{ESTILO_LABEL[p.estilo]}</p>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={generating} onClick={() => elegirPropuesta(p)}>
              Elegir esta
            </button>
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn" disabled={!puedeRegenerar || generating} onClick={generarTanda}>
          {puedeRegenerar ? "Generar 3 nuevas" : "Límite de tandas alcanzado"}
        </button>
      </div>
    </div>
  );
}
