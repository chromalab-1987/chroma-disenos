const KEY = "chromalab_clientes_v1";

const uid = () => `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;

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

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
