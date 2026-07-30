import { useState, useEffect } from "react";
import { fileToDataUrl } from "../lib/store.js";
import { TITLE_FONTS, BODY_FONTS, ensureFontLoaded, findFont } from "../lib/fonts.js";

const STEPS = ["Cliente", "Logo", "Paleta", "Tipografía", "Referencias", "Resumen"];

const PALETTE_ROLES = [
  { key: "primario", label: "Primario" },
  { key: "secundario", label: "Secundario" },
  { key: "acento", label: "Acento" },
  { key: "fondo", label: "Fondo" },
];

const CORNERS = [
  { key: "top-left", label: "Arriba izq." },
  { key: "top-right", label: "Arriba der." },
  { key: "bottom-left", label: "Abajo izq." },
  { key: "bottom-right", label: "Abajo der." },
];

export default function BrandKitWizard({ client, onSave, onCancel }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(client.name);
  const [kit, setKit] = useState(client.brandKit);

  useEffect(() => {
    ensureFontLoaded(kit.fontTitulo);
    ensureFontLoaded(kit.fontCuerpo);
  }, [kit.fontTitulo, kit.fontCuerpo]);

  const patch = (changes) => setKit((k) => ({ ...k, ...changes }));
  const patchPaleta = (role, hex) => setKit((k) => ({ ...k, paleta: { ...k.paleta, [role]: hex } }));
  const patchLogoPos = (changes) => setKit((k) => ({ ...k, logoPos: { ...k.logoPos, ...changes } }));

  const handleLogoFile = async (file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    patch({ logo: dataUrl });
  };

  const addReferences = async (files) => {
    const list = await Promise.all(
      Array.from(files).slice(0, 14 - kit.referencias.length).map(async (f) => ({
        id: `${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        image: await fileToDataUrl(f),
        nota: "",
      }))
    );
    patch({ referencias: [...kit.referencias, ...list] });
  };

  const updRefNota = (id, nota) =>
    patch({ referencias: kit.referencias.map((r) => (r.id === id ? { ...r, nota } : r)) });

  const removeRef = (id) => patch({ referencias: kit.referencias.filter((r) => r.id !== id) });

  const titleFont = findFont(kit.fontTitulo);
  const bodyFont = findFont(kit.fontCuerpo);

  const canAdvance = step !== 0 || name.trim().length > 0;

  return (
    <div>
      <div className="eyebrow">Brand Kit</div>
      <h1 className="page-title">{name || "Nuevo cliente"}</h1>
      <p className="page-sub">
        Se usa como referencia en todos los diseños generados para esta marca.
      </p>

      <div className="step-nav">
        {STEPS.map((s, i) => (
          <span key={s} className={`step ${i < step ? "done" : i === step ? "current" : ""}`}>
            {i + 1}. {s}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="card">
          <p className="section-label">Nombre del cliente</p>
          <div className="field">
            <label>Nombre / marca</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Café Aroma" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <p className="section-label">Logo</p>
          <label className="upload-zone">
            {kit.logo ? "Cambiar archivo…" : "Subir logo (PNG/SVG, fondo transparente recomendado)"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleLogoFile(e.target.files?.[0])} />
          </label>

          {kit.logo && (
            <div className="logo-preview-row">
              <div className="logo-preview-box on-light"><img src={kit.logo} alt="logo sobre fondo claro" /></div>
              <div className="logo-preview-box on-dark"><img src={kit.logo} alt="logo sobre fondo oscuro" /></div>
            </div>
          )}

          <p className="section-label" style={{ marginTop: 24 }}>Posición por defecto</p>
          <div className="pos-grid">
            {CORNERS.map((c) => (
              <button
                key={c.key}
                className={`pos-btn ${kit.logoPos.corner === c.key ? "active" : ""}`}
                onClick={() => patchLogoPos({ corner: c.key })}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="field" style={{ maxWidth: 200, marginTop: 14 }}>
            <label>Tamaño</label>
            <select value={kit.logoPos.size} onChange={(e) => patchLogoPos({ size: e.target.value })}>
              <option value="chico">Chico</option>
              <option value="mediano">Mediano</option>
              <option value="grande">Grande</option>
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <p className="section-label">Paleta de colores</p>
          <div className="color-row">
            {PALETTE_ROLES.map((r) => (
              <div key={r.key} className="color-field">
                <span className="role-label">{r.label}</span>
                <div className="color-input-group">
                  <input type="color" value={kit.paleta[r.key]} onChange={(e) => patchPaleta(r.key, e.target.value)} />
                  <input type="text" value={kit.paleta[r.key]} onChange={(e) => patchPaleta(r.key, e.target.value)} maxLength={7} />
                </div>
              </div>
            ))}
          </div>

          <div className="palette-preview" style={{ background: kit.paleta.fondo, color: kit.paleta.primario }}>
            <p className="mock-title" style={{ fontFamily: titleFont?.cssFamily, color: kit.paleta.primario }}>
              {name || "Tu marca"}
            </p>
            <p className="mock-body" style={{ fontFamily: bodyFont?.cssFamily, color: kit.paleta.secundario }}>
              Así se verían el texto principal y el secundario sobre el fondo elegido.
            </p>
            <span className="mock-cta" style={{ background: kit.paleta.acento, color: kit.paleta.fondo, fontFamily: bodyFont?.cssFamily }}>
              Ver más
            </span>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <p className="section-label">Tipografías (Google Fonts)</p>
          <div className="field">
            <label>Título</label>
            <select value={kit.fontTitulo} onChange={(e) => patch({ fontTitulo: e.target.value })}>
              {TITLE_FONTS.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Cuerpo</label>
            <select value={kit.fontCuerpo} onChange={(e) => patch({ fontCuerpo: e.target.value })}>
              {BODY_FONTS.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>
          </div>

          <div className="palette-preview" style={{ background: kit.paleta.fondo }}>
            <p className="mock-title" style={{ fontFamily: titleFont?.cssFamily, color: kit.paleta.primario, fontSize: 26 }}>
              {name || "Tu marca"} en título
            </p>
            <p className="mock-body" style={{ fontFamily: bodyFont?.cssFamily, color: kit.paleta.secundario }}>
              Y este es un ejemplo del texto de cuerpo, para leer copys más largos con esta tipografía.
            </p>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <p className="section-label">Referencias de estilo ({kit.referencias.length}/14)</p>
          <div className="ref-grid">
            {kit.referencias.map((r) => (
              <div key={r.id} className="ref-card">
                <img src={r.image} alt="referencia" />
                <textarea
                  placeholder="¿Qué te gusta de esta imagen?"
                  value={r.nota}
                  onChange={(e) => updRefNota(r.id, e.target.value)}
                />
                <button className="btn" style={{ width: "100%", borderRadius: 0, borderTop: "1px solid var(--border)" }} onClick={() => removeRef(r.id)}>
                  Quitar
                </button>
              </div>
            ))}
            {kit.referencias.length < 14 && (
              <label className="ref-add">
                + Agregar imágenes
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => addReferences(e.target.files)} />
              </label>
            )}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card">
          <p className="section-label">Ficha de marca</p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div className="logo-preview-box on-dark" style={{ width: 120 }}>
              {kit.logo ? <img src={kit.logo} alt="logo" /> : <span style={{ fontSize: 11, color: "var(--muted)" }}>Sin logo</span>}
            </div>
            <div>
              <p className="client-name" style={{ fontFamily: titleFont?.cssFamily }}>{name}</p>
              <p className="client-meta">{kit.fontTitulo} / {kit.fontCuerpo}</p>
              <div className="swatch-row" style={{ marginTop: 10 }}>
                {Object.values(kit.paleta).map((hex, i) => <span key={i} className="swatch" style={{ background: hex }} />)}
              </div>
            </div>
          </div>
          <p className="client-meta" style={{ marginTop: 18 }}>{kit.referencias.length} imágenes de referencia cargadas</p>
        </div>
      )}

      <div className="btn-row">
        {step > 0 && <button className="btn" onClick={() => setStep((s) => s - 1)}>Atrás</button>}
        <button className="btn" onClick={onCancel}>Cancelar</button>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" disabled={!canAdvance} onClick={() => setStep((s) => s + 1)}>Siguiente</button>
        ) : (
          <button className="btn btn-primary" onClick={() => onSave(name, kit)}>Guardar Brand Kit</button>
        )}
      </div>
    </div>
  );
}
