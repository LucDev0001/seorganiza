import { showToast } from "../utils/ui.js";

export function About() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 overflow-y-auto";

  element.innerHTML = `
    <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10 mb-6 rounded-xl">
        <div class="flex items-center gap-4">
            <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                <i class="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">Sobre</h1>
        </div>
        <div class="flex items-center gap-4">
            <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                <i class="fas fa-adjust text-xl"></i>
            </button>
        </div>
    </header>

    <div class="fade-in space-y-6 pb-10 max-w-md mx-auto w-full">
      <!-- Seção Sobre -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <div class="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full inline-block mb-4">
          <i class="fas fa-wallet text-4xl text-indigo-600"></i>
        </div>
        <h2 class="text-2xl font-bold dark:text-white">Se Organiza</h2>
        <p id="app-version" class="text-gray-500 dark:text-gray-400 mb-6">Versão 1.0.0</p>
        <button id="check-updates" class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Verificar Atualizações
        </button>
      </div>

      <!-- Seção de Links Úteis -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 space-y-2">
        <h3 class="font-bold text-sm px-2 pb-2 text-gray-500 uppercase">Links Úteis</h3>
        
        <button onclick="window.location.hash='/help'" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left">
          <i class="fas fa-question-circle text-gray-500 w-6 text-center"></i>
          <span class="font-medium text-gray-700 dark:text-gray-300">Central de Ajuda</span>
        </button>
        
        <button onclick="window.location.hash='/terms'" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left">
          <i class="fas fa-file-contract text-gray-500 w-6 text-center"></i>
          <span class="font-medium text-gray-700 dark:text-gray-300">Termos de Uso</span>
        </button>
        
        <button onclick="window.location.hash='/privacy'" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left">
          <i class="fas fa-shield-alt text-gray-500 w-6 text-center"></i>
          <span class="font-medium text-gray-700 dark:text-gray-300">Política de Privacidade</span>
        </button>
        
        <a href="mailto:lucianosantosseverino@gmail.com?subject=Bug%20no%20SeOrganiza" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
          <i class="fas fa-bug text-gray-500 w-6 text-center"></i>
          <span class="font-medium text-gray-700 dark:text-gray-300">Reportar um Bug</span>
        </a>
      </div>

      <!-- Seção de Apoio -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <h3 class="text-lg font-bold dark:text-white mb-2">💜 Apoie o Projeto</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Se este projeto te ajudou, considere apoiar com qualquer valor.
        </p>
        <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between gap-2">
          <span id="pix-key" class="text-gray-800 dark:text-gray-200 font-mono text-sm truncate select-all">11661221408</span>
          <button id="copy-pix-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1 transition-colors whitespace-nowrap">
            <i class="fas fa-copy"></i> Copiar
          </button>
        </div>
      </div>

      <!-- Seção Desenvolvido por -->
      <div class="text-center pt-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Criado por</p>
        <p class="font-bold text-gray-700 dark:text-gray-200">
          Santos Codes - Luciano Severino dos Santos
        </p>
        <div class="flex justify-center gap-4 mt-3">
          <a href="https://github.com/LucDev0001" target="_blank" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <i class="fab fa-github text-2xl"></i>
          </a>
          <a href="https://www.linkedin.com/in/lucianodev/" target="_blank" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <i class="fab fa-linkedin text-2xl"></i>
          </a>
        </div>
      </div>

      <button onclick="window.location.hash='/dashboard'" class="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg mt-8 transition-colors">
        Voltar
      </button>
    </div>
    `;

  // Lógica de Copiar Pix
  const copyBtn = element.querySelector("#copy-pix-btn");
  const pixKey = "11661221408"; // Valor limpo para copiar

  copyBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(pixKey)
      .then(() => {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        copyBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-700");
        copyBtn.classList.add("bg-green-600", "hover:bg-green-700");

        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.classList.add("bg-indigo-600", "hover:bg-indigo-700");
          copyBtn.classList.remove("bg-green-600", "hover:bg-green-700");
        }, 2000);
      })
      .catch((err) => {
        console.error("Erro ao copiar:", err);
        alert(
          "Não foi possível copiar automaticamente. Por favor, selecione e copie manualmente."
        );
      });
  });

  // Check Updates Logic
  const updateBtn = element.querySelector("#check-updates");
  updateBtn.onclick = async () => {
    updateBtn.innerHTML =
      '<i class="fas fa-circle-notch fa-spin"></i> Verificando...';
    updateBtn.disabled = true;

    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.update();

      // Se houver atualização, o listener global no pwa.js irá disparar o toast.
      // Aqui apenas damos feedback visual que a verificação ocorreu.
      setTimeout(() => {
        updateBtn.innerHTML = '<i class="fas fa-check"></i> Verificado';
        updateBtn.classList.add("text-green-600", "dark:text-green-400");

        setTimeout(() => {
          updateBtn.innerHTML = "Verificar Atualizações";
          updateBtn.classList.remove("text-green-600", "dark:text-green-400");
          updateBtn.disabled = false;
        }, 3000);
      }, 1000);
    } else {
      showToast("Service Worker não ativo neste navegador.", "error");
      updateBtn.innerHTML = "Verificar Atualizações";
      updateBtn.disabled = false;
    }
  };

  return element;
}
