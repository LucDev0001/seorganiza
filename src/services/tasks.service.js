import {
  db,
  auth,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "./firebase.js";

const COLLECTION_NAME = "tasks";

export async function addTask(task) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  await addDoc(collection(db, COLLECTION_NAME), {
    userId: user.uid,
    title: task.title,
    description: task.description || "",
    status: "pending", // pending, in_progress, done
    category: task.category || "",
    color: task.color || "blue",
    dueDate: task.dueDate || null,
    createdAt: new Date().toISOString(),
  });
}

export async function getTasks() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", user.uid)
  );
  const snapshot = await getDocs(q);
  const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Ordenação simples por data de criação
  return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function updateTaskStatus(taskId, newStatus) {
  if (!taskId) return;
  const taskRef = doc(db, COLLECTION_NAME, taskId);
  await updateDoc(taskRef, { status: newStatus });
}

export async function deleteTask(taskId) {
  if (!taskId) return;
  const taskRef = doc(db, COLLECTION_NAME, taskId);
  await deleteDoc(taskRef);
}
