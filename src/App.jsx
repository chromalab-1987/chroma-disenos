import { useState, useEffect } from "react";
import ClientList from "./components/ClientList.jsx";
import BrandKitWizard from "./components/BrandKitWizard.jsx";
import { loadClients, createClient, updateClient, updateBrandKit } from "./lib/store.js";

export default function App() {
  const [clients, setClients] = useState([]);
  const [view, setView] = useState({ screen: "list" }); // { screen: "list" | "wizard", clientId? }

  useEffect(() => { setClients(loadClients()); }, []);

  const refresh = () => setClients(loadClients());

  const handleCreate = () => {
    const client = createClient("");
    refresh();
    setView({ screen: "wizard", clientId: client.id });
  };

  const handleOpen = (id) => setView({ screen: "wizard", clientId: id });

  const handleSaveKit = (name, brandKit) => {
    updateClient(view.clientId, { name });
    updateBrandKit(view.clientId, brandKit);
    refresh();
    setView({ screen: "list" });
  };

  const current = clients.find((c) => c.id === view.clientId);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-mark">Chroma<span>Lab</span></div>
        <nav>
          <div className="nav-item active">Clientes</div>
        </nav>
      </aside>
      <main className="main">
        {view.screen === "list" && (
          <ClientList clients={clients} onOpen={handleOpen} onCreate={handleCreate} />
        )}
        {view.screen === "wizard" && current && (
          <BrandKitWizard
            client={current}
            onSave={handleSaveKit}
            onCancel={() => setView({ screen: "list" })}
          />
        )}
      </main>
    </div>
  );
}
