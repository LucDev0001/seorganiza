import { auth } from "../services/firebase.js";
import { startPremiumCheckout } from "../services/payment.service.js";

export function Plans() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-y-auto";

  const user = auth.currentUser;
  const email = user ? user.email : "";

  element.innerHTML = `
    <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div class="flex items-center gap-4">
            <button onclick="window.history.back()" class="text-gray-500 hover:text-indigo-600 transition-colors">
                <i class="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">Planos e Preços</h1>
        </div>
        <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
            <i class="fas fa-adjust text-xl"></i>
        </button>
    </header>

    <main class="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">
        
        <div class="text-center mb-10">
            <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Escolha o melhor para sua organização</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">Desbloqueie todo o potencial do Se Organiza com um pagamento único.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            <!-- Plano Grátis -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 relative">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Básico</h3>
                <div class="flex items-baseline gap-1 mb-6">
                    <span class="text-4xl font-extrabold text-gray-900 dark:text-white">R$ 0</span>
                    <span class="text-gray-500">/vitalício</span>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">Para quem está começando a se organizar.</p>
                
                <ul class="space-y-4 mb-8">
                    <li class="flex items-center gap-3 text-sm">
                        <i class="fas fa-check text-green-500"></i> Transações ilimitadas
                    </li>
                    <li class="flex items-center gap-3 text-sm">
                        <i class="fas fa-check text-green-500"></i> Tarefas e Notas ilimitadas
                    </li>
                    <li class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <i class="fas fa-exclamation-circle text-orange-500"></i> Limite de 3 categorias personalizadas
                    </li>
                    <li class="flex items-center gap-3 text-sm text-gray-400 line-through">
                        <i class="fas fa-times"></i> Exportação para Excel (CSV)
                    </li>
                    <li class="flex items-center gap-3 text-sm text-gray-400 line-through">
                        <i class="fas fa-times"></i> Suporte Prioritário
                    </li>
                </ul>

                <button onclick="window.location.hash='/dashboard'" class="w-full py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Continuar Grátis
                </button>
            </div>

            <!-- Plano Premium -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-indigo-500 p-8 relative transform md:-translate-y-4">
                <div class="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg uppercase tracking-wide">
                    Recomendado
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium</h3>
                <div class="flex items-baseline gap-1 mb-6">
                    <span class="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">R$ 9,90</span>
                    <span class="text-gray-500">/mês</span>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">Assinatura mensal. Cancele quando quiser.</p>
                
                <ul class="space-y-4 mb-8">
                    <li class="flex items-center gap-3 text-sm font-medium">
                        <div class="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full"><i class="fas fa-check text-indigo-600 dark:text-indigo-400"></i></div>
                        Tudo do plano Básico
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium">
                        <div class="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full"><i class="fas fa-check text-indigo-600 dark:text-indigo-400"></i></div>
                        Categorias Personalizadas Ilimitadas
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium">
                        <div class="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full"><i class="fas fa-check text-indigo-600 dark:text-indigo-400"></i></div>
                        Exportação Avançada (CSV/Excel)
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium">
                        <div class="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full"><i class="fas fa-check text-indigo-600 dark:text-indigo-400"></i></div>
                        Suporte Prioritário via WhatsApp
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium">
                        <div class="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full"><i class="fas fa-check text-indigo-600 dark:text-indigo-400"></i></div>
                        Sem anúncios ou banners
                    </li>
                </ul>

                <button id="btn-subscribe" class="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02]">
                    Quero ser Premium
                </button>
                <p class="text-xs text-center text-gray-400 mt-3">Pagamento seguro via Pix e Cartão</p>
            </div>
        </div>

        <!-- FAQ Rápido -->
        <div class="mt-16 max-w-2xl mx-auto">
            <h3 class="text-lg font-bold text-center mb-6">Dúvidas Frequentes</h3>
            <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h4 class="font-bold text-sm mb-1">É uma assinatura mensal?</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Sim! O plano é mensal e garante acesso contínuo a todas as funcionalidades.</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h4 class="font-bold text-sm mb-1">Como ativo meu plano?</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">A ativação é automática assim que o pagamento for confirmado.</p>
                </div>
            </div>
        </div>
    </main>
  `;

  // Lógica do Botão de Assinatura
  element.querySelector("#btn-subscribe").onclick = () => {
    startPremiumCheckout();
  };

  return element;
}
