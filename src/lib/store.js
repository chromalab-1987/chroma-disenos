const KEY = "chromalab_clientes_v1";

const uid = () => `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;

export const FORMATS = {
  instagram: { w: 1080, h: 1080, label: "Instagram (1:1)" },
  linkedin: { w: 1200, h: 628, label: "LinkedIn" },
  post45: { w: 1080, h: 1350, label: "Post 4:5" },
  story: { w: 1080, h: 1920, label: "Story / Banner" },
};

// Estimado de costo por imagen (USD), aproximado — ajustar según el pricing vigente de Gemini.
export const COSTO_ESTIMADO = { baja: 0.04, alta: 0.15 };

export const MAX_TANDAS = 2;

export function emptyBrandKit() {
  return {
    logo: null, // dataURL
    logoPos: { corner: "top-left", size: "mediano" },
    paleta: { primario: "#7B35D4", secundario: "#B98CF2", acento: "#E0637A", fondo: "#0E0B13" },
    fontTitulo: "Fraunces",
    fontCuerpo: "Inter",
    referencias: [], // { id, image, nota }
  };
}

export function loadClients() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveClients(clients) {
  localStorage.setItem(KEY, JSON.stringify(clients));
}

export function createClient(name) {
  const clients = loadClients();
  const client = {
    id: uid(),
    name,
    brandKit: emptyBrandKit(),
    proyectos: [],
    createdAt: new Date().toISOString(),
  };
  saveClients([...clients, client]);
  return client;
}

export function updateClient(id, changes) {
  const clients = loadClients();
  const next = clients.map((c) => (c.id === id ? { ...c, ...changes } : c));
  saveClients(next);
  return next.find((c) => c.id === id);
}

export function updateBrandKit(id, brandKitChanges) {
  const clients = loadClients();
  const next = clients.map((c) =>
    c.id === id ? { ...c, brandKit: { ...c.brandKit, ...brandKitChanges } } : c
  );
  saveClients(next);
  return next.find((c) => c.id === id);
}

export function deleteClient(id) {
  saveClients(loadClients().filter((c) => c.id !== id));
}

export function emptyProject() {
  return {
    id: uid(),
    modoEntrada: "copy", // "copy" | "prompt"
    copyTexto: "",
    promptLibre: "",
    formato: "instagram",
    ajustesExtra: "",
    modoGeneracion: "A", // "A" solo fondo | "B" todo generado
    promptsPorEstilo: {}, // { minimalista, bold, editorial }
    tandas: 0, // cuántas rondas de 3 propuestas ya se generaron
    propuestas: [], // { id, estilo, imagenUrl }
    propuestaElegidaId: null,
    disenoFinal: null,
    estado: "borrador", // borrador | en revision | aprobado | exportado
    gastoAcumulado: 0,
    createdAt: new Date().toISOString(),
  };
}

export function addProject(clientId, project) {
  const clients = loadClients();
  const next = clients.map((c) =>
    c.id === clientId ? { ...c, proyectos: [...c.proyectos, project] } : c
  );
  saveClients(next);
  return next.find((c) => c.id === clientId);
}

export function updateProject(clientId, projectId, changes) {
  const clients = loadClients();
  const next = clients.map((c) =>
    c.id === clientId
      ? { ...c, proyectos: c.proyectos.map((p) => (p.id === projectId ? { ...p, ...changes } : p)) }
      : c
  );
  saveClients(next);
  return next.find((c) => c.id === clientId);
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
