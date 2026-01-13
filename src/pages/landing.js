export function Landing() {
  const element = document.createElement("div");
  element.className =
    "min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200";

  element.innerHTML = `
        <!-- Navbar -->
        <nav class="flex justify-between items-center p-6 max-w-6xl mx-auto w-full z-10">
            <div class="flex items-center gap-2 text-indigo-600 text-2xl font-bold">
                <i class="fas fa-wallet"></i> Se Organiza
            </div>
            <div class="flex gap-4 items-center">
                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors p-2">
                    <i class="fas fa-adjust text-xl"></i>
                </button>
                <a href="#/login" class="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">Entrar</a>
            </div>
        </nav>

        <!-- Hero Section -->
        <main class="flex-1 flex flex-col items-center justify-center text-center p-6 max-w-5xl mx-auto w-full mt-8 md:mt-0">
            <div class="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm font-semibold tracking-wide uppercase">
                Gestão Pessoal Simplificada
            </div>
            
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                Organize sua vida <br>
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">em um só lugar.</span>
            </h1>
            
            <p class="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Gerencie suas finanças, planeje tarefas com Kanban e crie notas rápidas. Tudo sincronizado, seguro e acessível de qualquer dispositivo.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 w-full justify-center mb-16">
                <a href="#/login" class="px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2">
                    Começar Gratuitamente <i class="fas fa-arrow-right"></i>
                </a>
                <button id="install-pwa-landing" class="hidden px-8 py-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center gap-2">
                    <i class="fas fa-download"></i> Instalar App
                </button>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
                <div class="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-2xl mb-4">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Financeiro</h3>
                    <p class="text-gray-500 dark:text-gray-400 leading-relaxed">Controle receitas e despesas, visualize gráficos, defina metas e acompanhe seu saldo em tempo real.</p>
                </div>
                
                <div class="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-2xl mb-4">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Tarefas</h3>
                    <p class="text-gray-500 dark:text-gray-400 leading-relaxed">Organize projetos com quadros estilo Kanban, arraste e solte tarefas e defina prazos importantes.</p>
                </div>
                
                <div class="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-yellow-200 dark:hover:border-yellow-900 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center text-2xl mb-4">
                        <i class="fas fa-sticky-note"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Notas</h3>
                    <p class="text-gray-500 dark:text-gray-400 leading-relaxed">Capture ideias instantaneamente com notas coloridas, categorias e salvamento automático.</p>
                </div>

                <div class="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-2xl mb-4">
                        <i class="fab fa-youtube"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Educação</h3>
                    <p class="text-gray-500 dark:text-gray-400 leading-relaxed">Acesse conteúdos educativos e dicas financeiras do YouTube sem sair do aplicativo.</p>
                </div>
            </div>

            <!-- Testimonials Section -->
            <div class="mt-24 w-full">
                <h2 class="text-3xl font-bold mb-10 text-gray-900 dark:text-white">O que dizem nossos usuários</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-1 text-yellow-400 mb-3">
                            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                        </div>
                        <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">"Finalmente consegui organizar minhas contas. O visual é limpo e muito fácil de usar no celular."</p>
                        <p class="font-bold text-gray-900 dark:text-white text-sm">- Ana P.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-1 text-yellow-400 mb-3">
                            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                        </div>
                        <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">"O sistema de Kanban para tarefas mudou minha produtividade. Recomendo demais!"</p>
                        <p class="font-bold text-gray-900 dark:text-white text-sm">- Carlos M.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-1 text-yellow-400 mb-3">
                            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                        </div>
                        <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">"Simples, direto e funciona offline. Era exatamente o que eu estava procurando."</p>
                        <p class="font-bold text-gray-900 dark:text-white text-sm">- Beatriz S.</p>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="p-8 text-center text-gray-500 text-sm border-t border-gray-100 dark:border-gray-800 mt-12">
            <p>&copy; ${new Date().getFullYear()} Se Organiza. Desenvolvido com <i class="fas fa-heart text-red-500"></i> por Santos Codes.</p>
        </footer>
    `;

  // PWA Install Logic for Landing
  const installBtn = element.querySelector("#install-pwa-landing");

  const checkInstall = () => {
    if (window.deferredPrompt) {
      installBtn.classList.remove("hidden");
    }
  };
  checkInstall();
  window.addEventListener("pwa-install-available", checkInstall);

  installBtn.addEventListener("click", async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === "accepted") {
        installBtn.classList.add("hidden");
        window.deferredPrompt = null;
      }
    }
  });

  return element;
}
