import {
  auth,
  createUserWithEmailAndPassword,
  updateProfile,
  db,
  doc,
  setDoc,
  getDoc,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  googleProvider,
} from "../services/firebase.js";
import { showToast } from "../utils/ui.js";

function isValidCPF(cpf) {
  if (typeof cpf !== "string") return false;
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++)
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

export function Register() {
  const element = document.createElement("div");
  element.className =
    "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 transition-colors duration-200";

  // Loading inicial
  element.innerHTML = `
      <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p class="text-gray-500 dark:text-gray-400 font-medium">Verificando cadastro...</p>
      </div>
  `;

  const handleGoogleRegisterSuccess = async (user) => {
    try {
      // Verificar se o usuário já existe no banco, se não, cria
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          isPremium: false,
        });
      }

      showToast("Cadastro realizado com sucesso!", "success");
      window.location.hash = "/dashboard";
    } catch (error) {
      console.error(error);
      showToast("Erro ao finalizar cadastro.", "error");
    }
  };

  const renderForm = () => {
    element.innerHTML = `
        <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div class="text-center">
                <div class="mx-auto h-16 w-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                    <i class="fas fa-user-plus text-3xl text-white"></i>
                </div>
                <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Crie sua conta
                </h2>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Comece a organizar sua vida financeira hoje
                </p>
            </div>
            
            <form class="mt-8 space-y-6" id="register-form">
                <div class="space-y-4">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-user text-gray-400"></i>
                            </div>
                            <input id="name" name="name" type="text" required 
                                class="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all" 
                                placeholder="Seu nome">
                        </div>
                    </div>
                    <div>
                        <label for="cpf" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-id-card text-gray-400"></i>
                            </div>
                            <input id="cpf" name="cpf" type="text" required maxlength="14"
                                class="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all" 
                                placeholder="000.000.000-00">
                        </div>
                    </div>
                    <div>
                        <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Celular / WhatsApp</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-phone text-gray-400"></i>
                            </div>
                            <input id="phone" name="phone" type="tel" required maxlength="15"
                                class="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all" 
                                placeholder="(00) 00000-0000">
                        </div>
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-envelope text-gray-400"></i>
                            </div>
                            <input id="email" name="email" type="email" autocomplete="email" required 
                                class="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all" 
                                placeholder="seu@email.com">
                        </div>
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-lock text-gray-400"></i>
                            </div>
                            <input id="password" name="password" type="password" autocomplete="new-password" required minlength="6"
                                class="appearance-none rounded-lg relative block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all" 
                                placeholder="Mínimo 6 caracteres">
                            <button type="button" id="toggle-password" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 cursor-pointer focus:outline-none transition-colors">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Senha</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-lock text-gray-400"></i>
                            </div>
                            <input id="confirm-password" name="confirm-password" type="password" autocomplete="new-password" required 
                                class="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all" 
                                placeholder="Repita a senha">
                        </div>
                    </div>
                </div>

                <div class="flex items-center">
                    <input id="terms" name="terms" type="checkbox" required class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer">
                    <label for="terms" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Li e aceito os <a href="#/terms" target="_blank" class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">Termos de Uso</a> e <a href="#/privacy" target="_blank" class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">Política de Privacidade</a>
                    </label>
                </div>

                <button type="submit" id="btn-register" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50">
                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                        <i class="fas fa-user-plus group-hover:text-indigo-200 transition-colors"></i>
                    </span>
                    Criar Conta
                </button>
            </form>

            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">Ou cadastre-se com</span>
                </div>
            </div>

            <button type="button" id="btn-google-reg" class="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-5 h-5">
                Google
            </button>

            <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Já tem uma conta?
                <a href="#/login" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline transition-colors">
                    Faça login
                </a>
            </p>
        </div>
    `;

    // Toggle Password Visibility
    const toggleBtn = element.querySelector("#toggle-password");
    const passInput = element.querySelector("#password");
    toggleBtn.onclick = () => {
      const type =
        passInput.getAttribute("type") === "password" ? "text" : "password";
      passInput.setAttribute("type", type);
      toggleBtn.innerHTML = `<i class="fas ${
        type === "password" ? "fa-eye" : "fa-eye-slash"
      }"></i>`;
    };

    // Máscara de CPF
    const cpfInput = element.querySelector("#cpf");
    cpfInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = value;
    });

    // Máscara de Telefone
    const phoneInput = element.querySelector("#phone");
    phoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
      e.target.value = value;
    });

    const form = element.querySelector("#register-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value;
      const cpf = form.cpf.value.replace(/\D/g, ""); // Salva apenas números
      const phone = form.phone.value.replace(/\D/g, "");
      const email = form.email.value;
      const password = form.password.value;
      const confirmPassword = form["confirm-password"].value;

      if (!form.terms.checked) {
        showToast("Você deve aceitar os termos para continuar.", "error");
        return;
      }

      if (!isValidCPF(cpf)) {
        showToast("CPF inválido. Verifique os números.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showToast("As senhas não coincidem.", "error");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Create user document in Firestore
        try {
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: name,
            cpf: cpf,
            phone: phone,
            createdAt: new Date().toISOString(),
            isPremium: false,
          });
        } catch (dbError) {
          console.warn(
            "Aviso: Não foi possível salvar dados adicionais do perfil no momento.",
            dbError
          );
          // Não interrompe o fluxo, pois a conta de autenticação foi criada
        }

        showToast("Conta criada com sucesso!", "success");
        window.location.hash = "/dashboard";
      } catch (error) {
        console.error(error);
        let msg = "Erro ao criar conta.";
        if (error.code === "auth/email-already-in-use")
          msg = "Este email já está em uso.";
        if (error.code === "auth/weak-password") msg = "A senha é muito fraca.";
        showToast(msg, "error");
      }
    });

    // Lógica de Cadastro com Google (Movido para dentro do renderForm para garantir que o elemento exista)
    const btnGoogle = element.querySelector("#btn-google-reg");
    if (btnGoogle) {
      btnGoogle.onclick = async () => {
        // VERIFICAÇÃO DE SEGURANÇA: Google Auth não funciona em IP local (ex: 192.168.x.x) sem HTTPS
        if (
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1" &&
          window.location.protocol === "http:"
        ) {
          showToast(
            "Google Login requer HTTPS ou localhost. Não funciona via IP local.",
            "error"
          );
          return;
        }

        // Verifica se é PWA (Standalone) para usar Redirect
        // Removemos a verificação genérica de Mobile para tentar Popup primeiro
        const isPwa =
          window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone;

        if (isPwa) {
          try {
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (error) {
            console.error("Erro Redirect:", error);
            showToast(`Erro ao iniciar Google: ${error.message}`, "error");
          }
        }

        try {
          const result = await signInWithPopup(auth, googleProvider);
          await handleGoogleRegisterSuccess(result.user);
        } catch (error) {
          console.error("Erro Popup:", error);
          showToast("Erro ao cadastrar com Google.", "error");
        }
      };
    }
  };

  // Processar retorno do Redirect (PWA)
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        handleGoogleRegisterSuccess(result.user);
      } else {
        renderForm();
      }
    })
    .catch((error) => {
      console.error("Erro no redirecionamento Google:", error);
      showToast("Falha ao processar cadastro Google.", "error");
      renderForm();
    });

  return element;
}
