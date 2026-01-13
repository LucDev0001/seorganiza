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

const COLLECTION_NAME = "notes";

export async function getNotes() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", user.uid)
  );
  const snapshot = await getDocs(q);
  const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Ordenação no cliente para evitar bloqueio de índice composto no Firestore
  return notes.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });
}

export async function saveNote(note) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const data = {
    userId: user.uid,
    title: note.title || "",
    content: note.content || "",
    color: note.color || "white",
    category: note.category || "",
    updatedAt: new Date().toISOString(),
  };

  if (note.id) {
    await updateDoc(doc(db, COLLECTION_NAME, note.id), data);
    return note.id;
  } else {
    data.createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return docRef.id;
  }
}

export async function deleteNote(noteId) {
  if (!noteId) return;
  await deleteDoc(doc(db, COLLECTION_NAME, noteId));
}
