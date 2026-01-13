export function showToast(message, type = "success") {
  const toast = document.createElement("div");
  const colors = type === "success" ? "bg-green-500" : "bg-red-500";
  toast.className = `fixed bottom-4 right-4 ${colors} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-20 z-[70] flex items-center gap-2`;
  toast.innerHTML = `<i class="fas ${
    type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
  }"></i> <span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.remove("translate-y-20"));

  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function showConfirm(message, onConfirm) {
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm p-4 fade-in";
  modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 transform scale-100 transition-all">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirmação</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">${message}</p>
            <div class="flex justify-end gap-3">
                <button id="confirm-cancel" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancelar</button>
                <button id="confirm-ok" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Confirmar</button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
  const close = () => {
    modal.classList.add("opacity-0");
    setTimeout(() => modal.remove(), 200);
  };
  modal.querySelector("#confirm-cancel").onclick = close;
  modal.querySelector("#confirm-ok").onclick = () => {
    onConfirm();
    close();
  };
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}
