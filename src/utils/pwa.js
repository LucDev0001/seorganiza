import { showToast } from "./ui.js";

export function registerPWA() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        // Registra o SW
        const registration = await navigator.serviceWorker.register("./sw.js");

        // Detecta se há uma atualização esperando
        if (registration.waiting) {
          showUpdateNotification(registration.waiting);
          return;
        }

        // Monitora novas instalações
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          newWorker.addEventListener("statechange", () => {
            // Se o novo worker foi instalado e já existe um controlador (é uma atualização, não primeira visita)
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              showUpdateNotification(newWorker);
            }
          });
        });
      } catch (error) {
        console.error("Falha ao registrar Service Worker:", error);
      }
    });

    // Quando o novo SW assumir o controle, recarrega a página
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
  }

  // Captura o evento de instalação para usar em botões personalizados (ex: Landing Page)
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    window.dispatchEvent(new Event("pwa-install-available"));
  });
}

// Mostra um Toast personalizado com botão de "Atualizar"
function showUpdateNotification(worker) {
  // Evita duplicidade
  if (document.getElementById("pwa-update-toast")) return;

  const toast = document.createElement("div");
  toast.id = "pwa-update-toast";
  toast.className =
    "fixed bottom-4 right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-4 rounded-xl shadow-2xl z-[100] flex flex-col gap-3 animate-fade-in border border-gray-200 dark:border-gray-700 max-w-sm";

  toast.innerHTML = `
      <div class="flex items-center gap-3">
          <div class="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
            <i class="fas fa-sync-alt fa-spin"></i>
          </div>
          <div>
              <h4 class="font-bold text-sm">Nova versão disponível</h4>
              <p class="text-xs opacity-80 text-gray-500 dark:text-gray-400">O app foi atualizado. Recarregue para aplicar.</p>
          </div>
      </div>
      <div class="flex gap-2 justify-end mt-1">
          <button id="pwa-dismiss" class="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">Depois</button>
          <button id="pwa-update" class="text-xs font-bold bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">Atualizar Agora</button>
      </div>
  `;

  document.body.appendChild(toast);

  toast.querySelector("#pwa-update").onclick = () => {
    worker.postMessage({ type: "SKIP_WAITING" });
    toast.remove();
  };

  toast.querySelector("#pwa-dismiss").onclick = () => toast.remove();
}
