export function NotFound() {
  const element = document.createElement("div");
  element.className =
    "min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4";

  element.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700">
        <div class="mb-6 relative">
            <div class="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-xl opacity-50"></div>
            <i class="fas fa-compass text-6xl text-indigo-600 dark:text-indigo-400 relative z-10 animate-bounce"></i>
        </div>
        
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Página não encontrada</h2>
        
        <p class="text-gray-500 dark:text-gray-400 mb-8">
            Ops! Parece que você se perdeu. A página que você está procurando não existe ou foi movida.
        </p>

        <button onclick="window.location.hash='/dashboard'" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30">
            <i class="fas fa-home mr-2"></i> Voltar para o Início
        </button>
    </div>
  `;
  return element;
}
