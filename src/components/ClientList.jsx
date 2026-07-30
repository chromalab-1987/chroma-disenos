export default function ClientList({ clients, onOpen, onCreate }) {
  return (
    <div>
      <div className="eyebrow">Clientes</div>
      <h1 className="page-title">Marcas activas</h1>
      <p className="page-sub">
        Cada cliente tiene su propio Brand Kit — logo, paleta, tipografías y referencias —
        que se usa para generar todos sus diseños.
      </p>

      <div className="client-grid">
        {clients.map((c) => (
          <button key={c.id} className="client-card" onClick={() => onOpen(c.id)}>
            <div className="swatch-row">
              {Object.values(c.brandKit.paleta).map((hex, i) => (
                <span key={i} className="swatch" style={{ background: hex }} />
              ))}
            </div>
            <p className="client-name">{c.name}</p>
            <p className="client-meta">{c.proyectos.length} proyecto{c.proyectos.length === 1 ? "" : "s"}</p>
          </button>
        ))}
        <button className="new-client-card" onClick={onCreate}>+ Nuevo cliente</button>
      </div>
    </div>
  );
}
