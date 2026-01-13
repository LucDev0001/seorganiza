import {
  db,
  auth,
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
} from "./firebase.js";

export async function exportData() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const userId = user.uid;
  const data = {
    version: 1,
    timestamp: new Date().toISOString(),
    profile: {},
    transactions: [],
    tasks: [],
    notes: [],
    categories: [],
  };

  // Profile
  try {
    const profileSnap = await getDoc(doc(db, "users", userId));
    if (profileSnap.exists()) {
      data.profile = profileSnap.data();
    }
  } catch (e) {
    console.error("Erro ao exportar perfil", e);
  }

  // Helper to fetch collection
  const fetchCollection = async (name) => {
    try {
      const q = query(collection(db, name), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error(`Erro ao exportar ${name}`, e);
      return [];
    }
  };

  data.transactions = await fetchCollection("transactions");
  data.tasks = await fetchCollection("tasks");
  data.notes = await fetchCollection("notes");
  data.categories = await fetchCollection("categories");

  // Download
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `se_organiza_backup_${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(file) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.version)
          throw new Error("Arquivo de backup inválido ou versão incompatível.");

        const promises = [];

        // Restore Profile
        if (data.profile) {
          promises.push(
            setDoc(doc(db, "users", user.uid), data.profile, { merge: true })
          );
        }

        // Helper to restore collection
        const restoreCollection = (name, items) => {
          if (!Array.isArray(items)) return;
          items.forEach((item) => {
            const { id, ...docData } = item;
            if (id && docData) {
              // Force current userId to prevent data injection into other users
              docData.userId = user.uid;
              // Use setDoc with merge: true to update existing or create new
              promises.push(
                setDoc(doc(db, name, id), docData, { merge: true })
              );
            }
          });
        };

        restoreCollection("transactions", data.transactions);
        restoreCollection("tasks", data.tasks);
        restoreCollection("notes", data.notes);
        restoreCollection("categories", data.categories);

        await Promise.all(promises);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file);
  });
}
