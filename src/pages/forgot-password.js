import { auth, sendPasswordResetEmail } from "../services/firebase.js";
import { showToast } from "../utils/ui.js";

export function ForgotPassword() {
  const element = document.createElement("div");
  element.className =
    "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 transition-colors duration-200";

  element.innerHTML = `
        <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div class="text-center">
                <div class="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6">
                    <i class="fas fa-key text-3xl text-indigo-600 dark:text-indigo-400"></i>
                </div>
                <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Recuperar Senha
                </h2>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
            </div>
            
            <form class="mt-8 space-y-6" id="forgot-form">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email cadastrado</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-envelope text-gray-400"></i>
                        </div>
                        <input id="email" name="email" type="email" autocomplete="email" required 
                            class="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all" 
                            placeholder="seu@email.com">
                    </div>
                </div>

                <button type="submit" id="btn-reset" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/30">
                    Enviar Link de Recuperação
                </button>
            </form>

            <div class="mt-4 text-center">
                <a href="#/login" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline flex items-center justify-center gap-2">
                    <i class="fas fa-arrow-left"></i> Voltar para o Login
                </a>
            </div>
        </div>
    `;

  const form = element.querySelector("#forgot-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const btn = element.querySelector("#btn-reset");

    btn.disabled = true;
    btn.textContent = "Enviando...";

    try {
      await sendPasswordResetEmail(auth, email);
      showToast(
        "Email de recuperação enviado! Verifique sua caixa de entrada.",
        "success"
      );
      setTimeout(() => (window.location.hash = "/login"), 3000);
    } catch (error) {
      console.error(error);
      showToast(
        "Erro ao enviar email. Verifique se o endereço está correto.",
        "error"
      );
      btn.disabled = false;
      btn.textContent = "Enviar Link de Recuperação";
    }
  });

  return element;
}
