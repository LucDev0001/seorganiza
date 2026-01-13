import { auth } from "./firebase.js";
import { showToast } from "../utils/ui.js";

export async function startPremiumCheckout() {
  const user = auth.currentUser;
  if (!user) {
    showToast("Você precisa estar logado.", "error");
    return;
  }

  try {
    showToast("Gerando link de pagamento...", "info");

    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.uid,
        email: user.email,
        name: user.displayName,
      }),
    });

    const data = await response.json();

    if (data.url) {
      // Redireciona para o checkout do Abacate Pay
      window.location.href = data.url;
    } else {
      throw new Error("URL de pagamento não retornada");
    }
  } catch (error) {
    console.error(error);
    showToast("Erro ao iniciar pagamento. Tente novamente.", "error");
  }
}
