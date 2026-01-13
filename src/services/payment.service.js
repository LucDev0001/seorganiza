import { auth, db, doc, getDoc } from "./firebase.js";
import { showToast } from "../utils/ui.js";

export async function startPremiumCheckout() {
  const user = auth.currentUser;
  if (!user) {
    showToast("Você precisa estar logado.", "error");
    return;
  }

  try {
    showToast("Gerando link de pagamento...", "info");

    // Busca dados completos do usuário (incluindo CPF)
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.uid,
        email: user.email,
        name: user.displayName,
        taxId: userData.cpf || "00000000000", // Envia o CPF ou fallback
      }),
    });

    const data = await response.json();

    // Se a resposta não for OK (ex: 500), lança o erro detalhado vindo da API
    if (!response.ok) {
      const msg =
        data.details?.error ||
        data.details?.message ||
        JSON.stringify(data.details) ||
        "Erro desconhecido";
      // Limpa a mensagem se for um objeto JSON muito grande para o toast
      const cleanMsg =
        msg.length > 100
          ? "Erro na validação dos dados (verifique o console)"
          : msg;
      throw new Error(cleanMsg);
    }

    if (data.url) {
      // Redireciona para o checkout do Abacate Pay
      window.location.href = data.url;
    } else {
      throw new Error("URL de pagamento não retornada");
    }
  } catch (error) {
    console.error(error);
    showToast(`Erro: ${error.message}`, "error");
  }
}
