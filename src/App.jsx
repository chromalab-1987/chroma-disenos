import { useState, useEffect } from "react";
import ClientList from "./components/ClientList.jsx";
import ClientDetail from "./components/ClientDetail.jsx";
import BrandKitWizard from "./components/BrandKitWizard.jsx";
import ProjectForm from "./components/ProjectForm.jsx";
import { loadClients, createClient, updateClient, updateBrandKit, addProject } from "./lib/store.js";

export default function App() {
  const [clients, setClients] = useState([]);
  const [view, setView] = useState({ screen: "list" });

  useEffect(() => { setClients(loadClients()); }, []);

  const refresh = () => setClients(loadClients());

  const handleCreate = () => {
    const client = createClient("");
    refresh();
    setView({ screen: "wizard", clientId: client.id, isNew: true });
  };

  const handleOpen = (id) => setView({ screen: "detail", clientId: id });

  const handleSaveKit = (name, brandKit) => {
    updateClient(view.clientId, { name });
    updateBrandKit(view.clientId, brandKit);
    refresh();
    setView({ screen: "detail", clientId: view.clientId });
  };

  const handleSaveProject = (project) => {
    addProject(view.clientId, project);
    refresh();
    setView({ screen: "detail", clientId: view.clientId });
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

        {view.screen === "detail" && current && (
          <ClientDetail
            client={current}
            onEditKit={() => setView({ screen: "wizard", clientId: current.id })}
            onNewProject={() => setView({ screen: "project", clientId: current.id })}
            onOpenProject={() => {}}
            onBack={() => setView({ screen: "list" })}
          />
        )}

        {view.screen === "wizard" && current && (
          <BrandKitWizard
            client={current}
            onSave={handleSaveKit}
            onCancel={() => setView(view.isNew ? { screen: "list" } : { screen: "detail", clientId: current.id })}
          />
        )}

        {view.screen === "project" && current && (
          <ProjectForm
            client={current}
            onSave={handleSaveProject}
            onCancel={() => setView({ screen: "detail", clientId: current.id })}
          />
        )}
      </main>
    </div>
  );
}
