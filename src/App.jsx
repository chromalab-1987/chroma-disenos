import { useState, useEffect } from "react";
import ClientList from "./components/ClientList.jsx";
import ClientDetail from "./components/ClientDetail.jsx";
import BrandKitWizard from "./components/BrandKitWizard.jsx";
import ProjectForm from "./components/ProjectForm.jsx";
import ProposalsScreen from "./components/ProposalsScreen.jsx";
import { loadClients, createClient, updateClient, updateBrandKit, addProject, updateProject } from "./lib/store.js";

export default function App() {
  const [clients, setClients] = useState([]);
  const [view, setView] = useState({ screen: "list" });

  useEffect(() => { refresh(); }, []);

  const refresh = async () => setClients(await loadClients());

  const handleCreate = async () => {
    const client = await createClient("");
    await refresh();
    setView({ screen: "wizard", clientId: client.id, isNew: true });
  };

  const handleOpen = (id) => setView({ screen: "detail", clientId: id });

  const handleSaveKit = async (name, brandKit) => {
    await updateClient(view.clientId, { name });
    await updateBrandKit(view.clientId, brandKit);
    await refresh();
    setView({ screen: "detail", clientId: view.clientId });
  };

  // El proyecto ya trae los 3 prompts armados (Fase 2) — se guarda y se pasa a generar propuestas (Fase 3)
  const handleProjectPromptsReady = async (project) => {
    await addProject(view.clientId, project);
    await refresh();
    setView({ screen: "proposals", clientId: view.clientId, projectId: project.id });
  };

  // Se llama cuando ya se generó y eligió la imagen final en alta resolución
  const handleProposalsDone = async (updatedProject) => {
    await updateProject(view.clientId, updatedProject.id, updatedProject);
    await refresh();
    setView({ screen: "detail", clientId: view.clientId });
  };

  const current = clients.find((c) => c.id === view.clientId);
  const currentProject = current?.proyectos.find((p) => p.id === view.projectId);

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
            onOpenProject={(projectId) => setView({ screen: "proposals", clientId: current.id, projectId })}
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
            onSave={handleProjectPromptsReady}
            onCancel={() => setView({ screen: "detail", clientId: current.id })}
          />
        )}

        {view.screen === "proposals" && current && currentProject && (
          <ProposalsScreen
            client={current}
            project={currentProject}
            onDone={handleProposalsDone}
            onCancel={() => setView({ screen: "detail", clientId: current.id })}
          />
        )}
      </main>
    </div>
  );
}
