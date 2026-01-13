import {
  db,
  auth,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  setDoc,
} from "./firebase.js";

const COLLECTION_NAME = "transactions";

/**
 * Adiciona uma nova transação financeira
 * @param {Object} transaction - Objeto contendo { type, amount, category, date, description }
 */
export async function addTransaction(transaction) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId: user.uid,
      type: transaction.type, // 'income' ou 'expense'
      amount: Number(transaction.amount),
      category: transaction.category,
      date: transaction.date, // Formato YYYY-MM-DD
      status: transaction.status || "paid", // 'paid' ou 'pending'
      recurrence: transaction.recurrence || "none", // 'none', 'monthly', 'weekly'
      description: transaction.description || "",
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar transação:", error);
    throw error;
  }
}

export async function deleteTransaction(id) {
  if (!id) return;
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export async function updateTransaction(id, data) {
  if (!id) return;
  const updateData = { ...data };
  if (updateData.amount) updateData.amount = Number(updateData.amount);

  // Lógica de Recorrência Automática
  // Se a transação for marcada como 'paid' e tiver recorrência, cria a próxima
  if (updateData.status === "paid") {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const t = docSnap.data();
        // Verifica se era pendente e se tem recorrência válida
        if (t.status === "pending" && t.recurrence && t.recurrence !== "none") {
          let nextDate = new Date(t.date);
          // Adiciona o intervalo correto (evita problemas de timezone usando UTC ou setDate simples)
          if (t.recurrence === "monthly")
            nextDate.setMonth(nextDate.getMonth() + 1);
          if (t.recurrence === "weekly")
            nextDate.setDate(nextDate.getDate() + 7);

          // Cria a próxima transação como pendente
          await addTransaction({
            ...t,
            date: nextDate.toISOString().split("T")[0],
            status: "pending",
          });
        }
      }
    } catch (e) {
      console.error("Erro na recorrência automática:", e);
    }
  }

  await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
}

/**
 * Busca transações do usuário logado
 * @param {number|null} month - Mês (0-11) para filtro opcional
 * @param {number|null} year - Ano (ex: 2024) para filtro opcional
 * @returns {Promise<Array>} Lista de transações ordenadas por data
 */
export async function getTransactions(month = null, year = null) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  try {
    // Buscamos apenas pelo userId para evitar a necessidade de criar índices compostos complexos no Firestore imediatamente.
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    let transactions = [];

    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    // Ordenação e Filtragem no Cliente (Client-side)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (month !== null && year !== null) {
      transactions = transactions.filter((t) => {
        // Adiciona hora para evitar problemas de timezone na conversão simples
        const tDate = new Date(t.date + "T12:00:00");
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });
    }

    return transactions;
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    throw error;
  }
}

export function calculateBalance(transactions) {
  return transactions.reduce(
    (acc, curr) => {
      const val = Number(curr.amount);
      // Apenas transações pagas afetam o saldo atual
      if (curr.status === "pending") return acc;

      if (curr.type === "income") {
        acc.income += val;
        acc.total += val;
      } else {
        acc.expense += val;
        acc.total -= val;
      }
      return acc;
    },
    { income: 0, expense: 0, total: 0 }
  );
}

export async function getFinancialGoal() {
  const user = auth.currentUser;
  if (!user) return 0;
  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().financialGoal || 0;
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

export async function saveFinancialGoal(amount) {
  const user = auth.currentUser;
  if (!user) return;
  const docRef = doc(db, "users", user.uid);
  await setDoc(docRef, { financialGoal: Number(amount) }, { merge: true });
}
