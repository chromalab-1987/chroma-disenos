import { useState } from "react";
import { FORMATS, emptyProject } from "../lib/store.js";
import { buildPrompt } from "../lib/prompt.js";

const ESTILOS = ["minimalista", "bold", "editorial"];

export default function ProjectForm({ client, onSave, onCancel }) {
  const [project, setProject] = useState(emptyProject());
  const [preview, setPreview] = useState(null); // muestra los 3 prompts armados antes de confirmar

  const patch = (changes) => setProject((p) => ({ ...p, ...changes }));

  const contenidoListo =
    project.modoEntrada === "copy" ? project.copyTexto.trim().length > 0 : project.promptLibre.trim().length > 0;

  const handleArmarPrompts = () => {
    const promptsPorEstilo = {};
    ESTILOS.forEach((estilo) => {
      promptsPorEstilo[estilo] = buildPrompt({ brandKit: client.brandKit, project, estiloKey: estilo });
    });
    setPreview(promptsPorEstilo);
  };

  const handleConfirmar = () => {
    onSave({ ...project, promptsPorEstilo: preview });
  };

  if (preview) {
    return (
      <div>
        <div className="eyebrow">Nuevo diseño · {client.name}</div>
        <h1 className="page-title">Prompts listos para generar</h1>
        <p className="page-sub">
          Esto es lo que se le va a enviar a Gemini para cada uno de los 3 estilos. La generación en sí
          es el siguiente paso.
        </p>

        {ESTILOS.map((estilo) => (
          <div key={estilo} className="card" style={{ marginBottom: 14 }}>
            <p className="section-label" style={{ textTransform: "capitalize" }}>{estilo}</p>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", margin: 0 }}>
              {preview[estilo]}
            </pre>
          </div>
        ))}

        <div className="btn-row">
          <button className="btn" onClick={() => setPreview(null)}>Volver a editar</button>
          <button className="btn" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleConfirmar}>Generar propuestas</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="eyebrow">Nuevo diseño · {client.name}</div>
      <h1 className="page-title">Contenido del diseño</h1>
      <p className="page-sub">Usa el Brand Kit de {client.name} automáticamente.</p>

      <div className="card">
        <p className="section-label">Modo de entrada</p>
        <div className="pos-grid" style={{ maxWidth: 340 }}>
          <button className={`pos-btn ${project.modoEntrada === "copy" ? "active" : ""}`} onClick={() => patch({ modoEntrada: "copy" })}>
            Tengo el copy
          </button>
          <button className={`pos-btn ${project.modoEntrada === "prompt" ? "active" : ""}`} onClick={() => patch({ modoEntrada: "prompt" })}>
            Prompt libre de estilo
          </button>
        </div>

        {project.modoEntrada === "copy" ? (
          <div className="field" style={{ marginTop: 20 }}>
            <label>Copy a publicar</label>
            <textarea
              rows={4}
              style={{ width: "100%", background: "var(--surf-2)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", padding: 10, fontSize: 14, resize: "vertical" }}
              value={project.copyTexto}
              onChange={(e) => patch({ copyTexto: e.target.value })}
              placeholder="Pegá el texto que vas a publicar…"
            />
          </div>
        ) : (
          <div className="field" style={{ marginTop: 20 }}>
            <label>Describí el estilo/mood que buscás</label>
            <textarea
              rows={4}
              style={{ width: "100%", background: "var(--surf-2)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", padding: 10, fontSize: 14, resize: "vertical" }}
              value={project.promptLibre}
              onChange={(e) => patch({ promptLibre: e.target.value })}
              placeholder="Ej. algo cálido, cercano, con foco en un producto…"
            />
          </div>
        )}

        <p className="section-label" style={{ marginTop: 24 }}>Formato</p>
        <div className="field" style={{ maxWidth: 260 }}>
          <select value={project.formato} onChange={(e) => patch({ formato: e.target.value })}>
            {Object.entries(FORMATS).map(([key, f]) => <option key={key} value={key}>{f.label}</option>)}
          </select>
        </div>

        <p className="section-label" style={{ marginTop: 24 }}>Ajustes puntuales (opcional)</p>
        <div className="field">
          <textarea
            rows={2}
            style={{ width: "100%", background: "var(--surf-2)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", padding: 10, fontSize: 13, resize: "vertical" }}
            value={project.ajustesExtra}
            onChange={(e) => patch({ ajustesExtra: e.target.value })}
            placeholder="Ej. priorizar la referencia 2, usar solo el color de acento…"
          />
        </div>

        <p className="section-label" style={{ marginTop: 24 }}>¿Cómo querés generar el diseño?</p>
        <div className="pos-grid" style={{ maxWidth: 480, gridTemplateColumns: "1fr 1fr" }}>
          <button className={`pos-btn ${project.modoGeneracion === "A" ? "active" : ""}`} onClick={() => patch({ modoGeneracion: "A" })} style={{ textAlign: "left", padding: 12 }}>
            Solo fondo<br /><span style={{ opacity: .7, fontWeight: 400 }}>texto y logo se agregan después, editable</span>
          </button>
          <button className={`pos-btn ${project.modoGeneracion === "B" ? "active" : ""}`} onClick={() => patch({ modoGeneracion: "B" })} style={{ textAlign: "left", padding: 12 }}>
            Diseño completo por IA<br /><span style={{ opacity: .7, fontWeight: 400 }}>más rápido, menos preciso</span>
          </button>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" disabled={!contenidoListo} onClick={handleArmarPrompts}>Armar prompts</button>
      </div>
    </div>
  );
}
