export default function ClientDetail({ client, onEditKit, onNewProject, onBack, onOpenProject }) {
  const { brandKit, proyectos } = client;

  return (
    <div>
      <div className="eyebrow">Cliente</div>
      <h1 className="page-title">{client.name}</h1>
      <p className="page-sub">Ficha de marca y diseños generados.</p>

      <div className="card" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        <div className="logo-preview-box on-dark" style={{ width: 100 }}>
          {brandKit.logo ? <img src={brandKit.logo} alt="logo" /> : <span style={{ fontSize: 11, color: "var(--muted)" }}>Sin logo</span>}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="swatch-row">
            {Object.values(brandKit.paleta).map((hex, i) => <span key={i} className="swatch" style={{ background: hex }} />)}
          </div>
          <p className="client-meta">{brandKit.fontTitulo} / {brandKit.fontCuerpo} · {brandKit.referencias.length} referencias</p>
        </div>
        <button className="btn" onClick={onEditKit}>Editar Brand Kit</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "32px 0 14px" }}>
        <p className="section-label" style={{ margin: 0 }}>Diseños</p>
        <button className="btn btn-primary" onClick={onNewProject}>+ Nuevo diseño</button>
      </div>

      {proyectos.length === 0 ? (
        <div className="card" style={{ color: "var(--muted)", fontSize: 13 }}>
          Todavía no hay diseños para esta marca. Empezá uno nuevo con "Nuevo diseño".
        </div>
      ) : (
        <div className="client-grid">
          {proyectos.map((p) => (
            <button key={p.id} className="client-card" onClick={() => onOpenProject(p.id)}>
              <p className="client-name" style={{ fontSize: 14 }}>{p.modoEntrada === "copy" ? p.copyTexto.slice(0, 40) || "(sin copy)" : p.promptLibre.slice(0, 40) || "(sin prompt)"}</p>
              <p className="client-meta">{p.estado}</p>
            </button>
          ))}
        </div>
      )}

      <div className="btn-row" style={{ justifyContent: "flex-start" }}>
        <button className="btn" onClick={onBack}>← Todos los clientes</button>
      </div>
    </div>
  );
}
