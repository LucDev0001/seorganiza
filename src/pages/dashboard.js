import {
  auth,
  signOut,
  db,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
} from "../services/firebase.js";
import {
  getTransactions,
  calculateBalance,
  deleteTransaction,
  updateTransaction,
  getFinancialGoal,
  saveFinancialGoal,
} from "../services/finance.js";
import { getTasks } from "../services/tasks.service.js";
import { getNotes } from "../services/notes.service.js";
import { showToast, showConfirm } from "../utils/ui.js";
import { requestNotificationPermission } from "../services/notifications.service.js";

export function Dashboard() {
  const user = auth.currentUser;

  // Verificação de segurança: Bloquear acesso se suspenso
  if (user) {
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();

        // 1. Verificar Suspensão
        if (data.isSuspended) {
          signOut(auth).then(() => {
            window.location.hash = "/login";
            showToast("Sua conta foi suspensa.", "error");
          });
          return;
        }

        // 2. Injetar Botão de Admin se tiver permissão
        if (data.isAdmin || data.role === "admin") {
          const adminBtn = document.createElement("button");
          adminBtn.className =
            "min-w-[80px] flex flex-col items-center gap-2 snap-center group";
          adminBtn.onclick = () => (window.location.hash = "/admin");
          adminBtn.innerHTML = `<div class="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:scale-110 group-hover:shadow-md transition-all duration-300"><i class="fas fa-shield-alt text-xl"></i></div><span class="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Admin</span>`;
          const grid = element.querySelector("#quick-actions-grid");
          if (grid) grid.appendChild(adminBtn);
        }
      }
    });
  }

  // Fallback seguro para nome de exibição
  const displayName = user && (user.displayName || user.email.split("@")[0]);
  let currentTransactions = []; // Estado local para filtro
  let currentFilterType = "all"; // 'all', 'income', 'expense'
  let currentDate = new Date(); // Estado para navegação de data
  let showValues = localStorage.getItem("showValues") !== "false"; // Persistência do modo privacidade
  let isZenMode = false; // Estado do Modo Zen

  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";

  element.innerHTML = `
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <div class="flex items-center gap-2">
        <i class="fas fa-chart-pie text-indigo-600 text-xl"></i>
        <h1 class="text-xl font-bold text-gray-800 dark:text-white">Se Organiza</h1>
      </div>
      <div class="flex items-center gap-4">
        <button id="header-premium-btn" class="hidden bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse hover:scale-105 transition-transform">
            <i class="fas fa-crown mr-1"></i> PREMIUM
        </button>
        <button id="voice-cmd-btn" class="text-gray-500 hover:text-indigo-600 transition-colors hidden sm:block" title="Comando de Voz">
            <i class="fas fa-microphone text-xl"></i>
        </button>
        <button id="zen-mode-btn" class="text-gray-500 hover:text-emerald-500 transition-colors" title="Modo Zen (Foco)">
            <i class="fas fa-spa text-xl"></i>
        </button>
        <button id="global-search-btn" class="text-gray-500 hover:text-indigo-600 transition-colors" title="Busca Global">
            <i class="fas fa-search text-xl"></i>
        </button>
        <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
            <i class="fas fa-adjust text-xl"></i>
        </button>
        <button id="btn-notifications" class="text-gray-500 hover:text-indigo-600 transition-colors relative" title="Ativar Notificações">
            <i class="fas fa-bell text-xl"></i>
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
        </button>
        <button id="logout-btn" class="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Sair">
            <i class="fas fa-sign-out-alt text-lg"></i>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6 max-w-5xl mx-auto w-full overflow-y-auto">
      
      <!-- Premium Upsell Banner (Injected via JS if free) -->
      <div id="premium-banner" class="hidden mb-8 bg-gray-900 dark:bg-gray-800 rounded-2xl p-1 shadow-xl overflow-hidden relative group cursor-pointer">
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div class="relative bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg">
                      <i class="fas fa-crown"></i>
                  </div>
                  <div>
                      <h3 class="font-bold text-gray-900 dark:text-white">Desbloqueie o Poder Total!</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Categorias ilimitadas, exportação CSV e sem anúncios.</p>
                  </div>
              </div>
              <button class="w-full sm:w-auto px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap">
                  Virar Premium R$ 9,99
              </button>
          </div>
      </div>
      
      <!-- Top Section: Greeting & Date Picker -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Olá, <span class="text-indigo-600 dark:text-indigo-400">${displayName}</span> 👋</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Visão geral das suas finanças.</p>
        </div>
        
        <div class="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-sm p-1 border border-gray-100 dark:border-gray-700">
            <button id="prev-month" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                <i class="fas fa-chevron-left text-xs"></i>
            </button>
            <span id="current-date-display" class="px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 min-w-[140px] text-center capitalize">
                ...
            </span>
            <button id="next-month" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                <i class="fas fa-chevron-right text-xs"></i>
            </button>
        </div>
      </div>

      <!-- Hero Section: Balance Card & Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Main Balance Card -->
        <div id="hero-card" class="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden group transition-all duration-500">
            <!-- Decorative Circles -->
            <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div class="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
            
            <div class="relative z-10">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <p class="text-indigo-100 text-sm font-medium mb-1 flex items-center gap-2">
                            Saldo Total
                            <button id="toggle-privacy" class="hover:text-white transition-colors focus:outline-none">
                                <i class="fas ${
                                  showValues ? "fa-eye" : "fa-eye-slash"
                                }"></i>
                            </button>
                        </p>
                        <h3 id="balance-amount" class="text-4xl font-bold tracking-tight"><div class="h-10 w-48 bg-white/20 rounded animate-pulse mt-1"></div></h3>
                    </div>
                    <div class="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                        <i class="fas fa-wallet text-2xl"></i>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div>
                        <p class="text-indigo-100 text-xs mb-1"><i class="fas fa-arrow-up text-emerald-300 mr-1"></i> Receitas</p>
                        <p id="income-amount" class="text-lg font-semibold"><div class="h-6 w-24 bg-white/20 rounded animate-pulse"></div></p>
                    </div>
                    <div>
                        <p class="text-indigo-100 text-xs mb-1"><i class="fas fa-arrow-down text-red-300 mr-1"></i> Despesas</p>
                        <p id="expense-amount" class="text-lg font-semibold"><div class="h-6 w-24 bg-white/20 rounded animate-pulse"></div></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pending Alerts & Goal -->
        <div id="pending-goal-section" class="space-y-4 flex flex-col transition-all duration-300">
            <!-- Pending Alerts -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex-1 flex flex-col justify-center">
                <h4 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Pendências do Mês</h4>
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-orange-500"></div> A Pagar</span>
                        <span id="pending-expense" class="font-bold text-orange-600 dark:text-orange-400">R$ 0,00</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-blue-500"></div> A Receber</span>
                        <span id="pending-income" class="font-bold text-blue-600 dark:text-blue-400">R$ 0,00</span>
                    </div>
                </div>
            </div>

            <!-- Mini Goal -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-gray-700 dark:text-gray-200">Meta Mensal</span>
                    <button id="edit-goal-btn" class="text-xs text-indigo-600 hover:underline">Editar</button>
                </div>
                <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div id="goal-progress-bar" class="bg-purple-500 h-2 rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
                <p id="goal-status-text" class="text-xs text-gray-500 text-right">0% atingido</p>
            </div>
        </div>
      </div>

      <!-- Quick Actions (Horizontal Scroll on Mobile) -->
      <div id="quick-actions-section" class="mb-8 transition-all duration-300">
          <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">Acesso Rápido</h3>
          <div id="quick-actions-grid" class="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
            <!-- Buttons injected via JS helper to avoid repetition -->
          </div>
      </div>

      <!-- Smart Insights (Innovative Feature) -->
      <div id="insights-section" class="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-5 mb-8 text-white relative overflow-hidden transition-all duration-300">
        <div class="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12"></div>
        <div class="flex items-center gap-2 mb-4">
            <i class="fas fa-lightbulb text-yellow-300 text-xl"></i>
            <h3 class="text-lg font-bold">Insights Inteligentes</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="insights-container">
            <p class="text-sm opacity-80 col-span-full">Analisando suas finanças...</p>
        </div>
      </div>

      <!-- Budget by Category -->
      <div id="budget-section" class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 transition-all duration-300">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Orçamento por Categoria</h3>
            <span class="text-xs text-gray-500 dark:text-gray-400">Top gastos do mês</span>
          </div>
          <div id="budget-container" class="space-y-5">
              <p class="text-sm opacity-80">Carregando...</p>
          </div>
      </div>

      <!-- Savings Goals Section -->
      <div id="savings-goals-section" class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 transition-all duration-300">
          <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-gray-800 dark:text-white">Metas de Economia</h3>
              <button id="add-goal-btn" class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg transition-colors flex items-center">
                  <i class="fas fa-plus mr-1"></i> Nova Meta
              </button>
          </div>
          <div id="goals-container" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p class="text-sm opacity-80 col-span-full">Carregando metas...</p>
          </div>
      </div>

      <!-- Interactive Calendar -->
      <div id="calendar-section" class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 transition-all duration-300">
          <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-bold text-gray-800 dark:text-white">Calendário de Atividades</h3>
              <div class="flex gap-3 text-xs">
                  <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-emerald-500"></div> Receita</span>
                  <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-red-500"></div> Despesa</span>
                  <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-blue-500"></div> Tarefa</span>
              </div>
          </div>
          
          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 gap-2 mb-2 text-center">
              <div class="text-xs font-bold text-gray-400">Dom</div>
              <div class="text-xs font-bold text-gray-400">Seg</div>
              <div class="text-xs font-bold text-gray-400">Ter</div>
              <div class="text-xs font-bold text-gray-400">Qua</div>
              <div class="text-xs font-bold text-gray-400">Qui</div>
              <div class="text-xs font-bold text-gray-400">Sex</div>
              <div class="text-xs font-bold text-gray-400">Sáb</div>
          </div>
          
          <!-- Calendar Grid -->
          <div id="calendar-grid" class="grid grid-cols-7 gap-2">
              <!-- Injected via JS -->
          </div>
      </div>

      <!-- Charts & Transactions Grid -->
      <div id="charts-section" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        <!-- Charts Tab -->
        <div id="charts-container" class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300">
          <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-bold text-gray-800 dark:text-white">Análise de Gastos</h3>
              <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button id="chart-tab-expense" class="px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white transition-all">Despesas</button>
                  <button id="chart-tab-income" class="px-3 py-1 text-xs font-bold rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-all">Receitas</button>
              </div>
          </div>
          
          <div class="relative h-64 w-full flex items-center justify-center" id="chart-container-expense">
             <canvas id="expenses-chart"></canvas>
          </div>
          <div class="relative h-64 w-full flex items-center justify-center hidden" id="chart-container-income">
             <canvas id="incomes-chart"></canvas>
          </div>
        </div>

        <!-- Recent Transactions List with Actions -->
        <div id="transactions-section" class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[400px] transition-all duration-300">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white">Transações</h3>
                <div class="relative">
                    <input type="text" id="trans-search" placeholder="Buscar..." class="pl-8 pr-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 outline-none w-32 focus:w-48 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400">
                    <i class="fas fa-search absolute left-2.5 top-2 text-gray-400 text-xs"></i>
                </div>
            </div>
            <div id="dashboard-transactions" class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                <!-- Injected via JS -->
            </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div id="edit-trans-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 class="text-lg font-bold mb-4">Editar Transação</h3>
            <form id="edit-trans-form" class="space-y-3">
                <input type="hidden" name="id">
                <div>
                    <label class="block text-sm font-medium mb-1">Descrição</label>
                    <input type="text" name="description" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Valor</label>
                    <input type="number" step="0.01" name="amount" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                </div>
                <div class="flex items-center">
                    <input id="edit-status" name="status" type="checkbox" class="w-4 h-4 text-indigo-600 rounded">
                    <label for="edit-status" class="ml-2 text-sm">Pago / Recebido</label>
                </div>
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" id="close-edit-modal" class="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                    <button type="submit" class="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
                </div>
            </form>
        </div>
      </div>

      <!-- Goal Modal -->
      <div id="goal-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 class="text-lg font-bold mb-4">Definir Meta de Saldo</h3>
            <form id="goal-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Valor Alvo (R$)</label>
                    <input type="number" step="0.01" name="goalAmount" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ex: 5000,00">
                </div>
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" id="close-goal-modal" class="px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded">Cancelar</button>
                    <button type="submit" class="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700">Salvar</button>
                </div>
            </form>
        </div>
      </div>

      <!-- Savings Goal Modal -->
      <div id="savings-goal-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white" id="savings-goal-modal-title">Nova Meta</h3>
            <form id="savings-goal-form" class="space-y-4">
                <input type="hidden" name="goalId">
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nome da Meta</label>
                    <input type="text" name="title" required class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="Ex: Viagem, Carro Novo">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Valor Alvo (R$)</label>
                    <input type="number" step="0.01" name="targetAmount" required class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Valor Atual (R$)</label>
                    <input type="number" step="0.01" name="currentAmount" value="0" required class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ícone</label>
                    <div class="flex gap-3 overflow-x-auto pb-2 custom-scrollbar" id="goal-icons-select">
                        <!-- Icons generated by JS -->
                    </div>
                    <input type="hidden" name="icon" value="fa-piggy-bank">
                </div>
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" id="close-savings-goal-modal" class="px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded">Cancelar</button>
                    <button type="submit" class="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
                </div>
            </form>
        </div>
      </div>

      <!-- Global Search Modal -->
      <div id="global-search-modal" class="fixed inset-0 bg-black/50 hidden items-start justify-center z-[60] backdrop-blur-sm p-4 pt-20">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <i class="fas fa-search text-gray-400"></i>
                <input type="text" id="global-search-input" placeholder="Pesquisar em tudo (Tarefas, Notas, Transações)..." class="flex-1 bg-transparent outline-none text-lg text-gray-800 dark:text-gray-200 placeholder-gray-400">
                <button id="close-global-search" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
            </div>
            <div id="global-search-results" class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <div class="text-center text-gray-500 py-10">Digite para pesquisar...</div>
            </div>
        </div>
      </div>
    </main>
  `;

  // --- Helper: Render Quick Actions ---
  const quickActionsContainer = element.querySelector("#quick-actions-grid");
  const actions = [
    {
      icon: "fa-plus",
      label: "Nova Transação",
      color: "indigo",
      link: "/finance",
    },
    { icon: "fa-tasks", label: "Tarefas", color: "blue", link: "/tasks" },
    { icon: "fa-sticky-note", label: "Notas", color: "yellow", link: "/notes" },
    { icon: "fa-user", label: "Perfil", color: "green", link: "/profile" },
    { icon: "fa-video", label: "Vídeos", color: "red", link: "/videos" },
    { icon: "fa-info-circle", label: "Sobre", color: "purple", link: "/about" },
  ];

  actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.className =
      "min-w-[80px] flex flex-col items-center gap-2 snap-center group";
    btn.onclick = () => (window.location.hash = action.link);
    btn.innerHTML = `
        <div class="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-${action.color}-500 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
            <i class="fas ${action.icon} text-xl"></i>
        </div>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">${action.label}</span>
      `;
    quickActionsContainer.appendChild(btn);
  });

  // --- Date Navigation Logic ---
  const dateDisplay = element.querySelector("#current-date-display");
  const updateDateDisplay = () => {
    dateDisplay.textContent = currentDate.toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    loadFinancialData();
  };

  element.querySelector("#prev-month").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateDateDisplay();
  };
  element.querySelector("#next-month").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateDateDisplay();
  };

  // Inicializa apenas o texto da data para evitar erro de referência (loadFinancialData ainda não definido)
  dateDisplay.textContent = currentDate.toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // --- Privacy Toggle Logic ---
  const togglePrivacyBtn = element.querySelector("#toggle-privacy");
  togglePrivacyBtn.onclick = () => {
    showValues = !showValues;
    localStorage.setItem("showValues", showValues);
    togglePrivacyBtn.innerHTML = `<i class="fas ${
      showValues ? "fa-eye" : "fa-eye-slash"
    }"></i>`;
    loadFinancialData(); // Re-render values
  };

  // --- Chart Tabs Logic ---
  const tabExpense = element.querySelector("#chart-tab-expense");
  const tabIncome = element.querySelector("#chart-tab-income");
  const containerExpense = element.querySelector("#chart-container-expense");
  const containerIncome = element.querySelector("#chart-container-income");

  const switchChartTab = (type) => {
    if (type === "expense") {
      tabExpense.className =
        "px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white transition-all";
      tabIncome.className =
        "px-3 py-1 text-xs font-bold rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-all";
      containerExpense.classList.remove("hidden");
      containerIncome.classList.add("hidden");
    } else {
      tabIncome.className =
        "px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white transition-all";
      tabExpense.className =
        "px-3 py-1 text-xs font-bold rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-all";
      containerIncome.classList.remove("hidden");
      containerExpense.classList.add("hidden");
    }
  };

  tabExpense.onclick = () => switchChartTab("expense");
  tabIncome.onclick = () => switchChartTab("income");

  // --- Zen Mode Logic ---
  const zenBtn = element.querySelector("#zen-mode-btn");
  zenBtn.onclick = () => {
    isZenMode = !isZenMode;

    // Visual Feedback on Button
    zenBtn.classList.toggle("text-emerald-500", isZenMode);
    zenBtn.classList.toggle("text-gray-500", !isZenMode);

    // Sections to hide
    const sections = [
      "#quick-actions-section",
      "#insights-section",
      "#budget-section",
      "#savings-goals-section",
      "#calendar-section",
      "#charts-container",
      "#transactions-section",
      "#pending-goal-section",
    ];

    sections.forEach((id) => {
      const el = element.querySelector(id);
      if (el) {
        if (isZenMode) el.classList.add("hidden");
        else el.classList.remove("hidden");
      }
    });

    // Expand Hero Card
    const heroCard = element.querySelector("#hero-card");
    if (heroCard) {
      if (isZenMode) {
        heroCard.classList.remove("lg:col-span-2");
        heroCard.classList.add("col-span-full");
      } else {
        heroCard.classList.add("lg:col-span-2");
        heroCard.classList.remove("col-span-full");
      }
    }

    showToast(isZenMode ? "Modo Zen ativado" : "Modo Zen desativado", "info");
  };

  // --- Voice Command Logic ---
  const voiceBtn = element.querySelector("#voice-cmd-btn");
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;

    voiceBtn.onclick = () => {
      voiceBtn.classList.add("text-red-500", "animate-pulse");
      recognition.start();
    };

    recognition.onresult = (event) => {
      voiceBtn.classList.remove("text-red-500", "animate-pulse");
      const transcript = event.results[0][0].transcript;
      showToast(`Ouvido: "${transcript}"`);

      // Open Global Search with transcript
      globalSearchInput.value = transcript;
      globalSearchBtn.click();
    };

    recognition.onerror = () => {
      voiceBtn.classList.remove("text-red-500", "animate-pulse");
      showToast("Não entendi. Tente novamente.", "error");
    };
  } else {
    voiceBtn.style.display = "none";
  }

  // --- Notification Button Logic ---
  const notifBtn = element.querySelector("#btn-notifications");
  notifBtn.onclick = () => {
    if (Notification.permission !== "granted") {
      requestNotificationPermission(user);
    } else {
      window.location.hash = "/notifications";
    }
  };

  // --- Premium Check Logic ---
  // Substituído por listener em tempo real (onSnapshot)
  const setupPremiumListener = () => {
    if (!user) return;

    // Escuta mudanças no documento do usuário em tempo real
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isPremium = data.isPremium;
        const headerBtn = element.querySelector("#header-premium-btn");
        const banner = element.querySelector("#premium-banner");

        if (isPremium) {
          // Se virou Premium, esconde os banners imediatamente
          if (headerBtn) headerBtn.classList.add("hidden");
          if (banner) banner.classList.add("hidden");
        } else {
          // Se não é Premium, mostra
          if (headerBtn) headerBtn.classList.remove("hidden");
          if (headerBtn)
            headerBtn.onclick = () => (window.location.hash = "/plans");
          if (banner) banner.classList.remove("hidden");
          if (banner) banner.onclick = () => (window.location.hash = "/plans");
        }
      }
    });
  };
  setupPremiumListener();

  // Lógica de Logout
  element.querySelector("#logout-btn").addEventListener("click", async () => {
    await signOut(auth);
  });

  // Edit Modal Logic
  const editModal = element.querySelector("#edit-trans-modal");
  const editForm = element.querySelector("#edit-trans-form");

  element.querySelector("#close-edit-modal").onclick = () =>
    editModal.classList.add("hidden");

  editForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = editForm.id.value;
    const data = {
      description: editForm.description.value,
      amount: editForm.amount.value,
      status: editForm.status.checked ? "paid" : "pending",
    };
    await updateTransaction(id, data);
    editModal.classList.add("hidden");
    loadFinancialData(); // Reload
  };

  // Goal Modal Logic
  const goalModal = element.querySelector("#goal-modal");
  const goalForm = element.querySelector("#goal-form");
  const editGoalBtn = element.querySelector("#edit-goal-btn");
  const closeGoalBtn = element.querySelector("#close-goal-modal");

  editGoalBtn.onclick = () => goalModal.classList.remove("hidden");
  closeGoalBtn.onclick = () => goalModal.classList.add("hidden");

  goalForm.onsubmit = async (e) => {
    e.preventDefault();
    await saveFinancialGoal(goalForm.goalAmount.value);
    goalModal.classList.add("hidden");
    loadFinancialData();
  };

  // Global Search Logic
  const globalSearchModal = element.querySelector("#global-search-modal");
  const globalSearchInput = element.querySelector("#global-search-input");
  const globalSearchResults = element.querySelector("#global-search-results");
  const closeGlobalSearch = element.querySelector("#close-global-search");
  const globalSearchBtn = element.querySelector("#global-search-btn");

  globalSearchBtn.onclick = () => {
    globalSearchModal.classList.remove("hidden");
    globalSearchModal.classList.add("flex");
    globalSearchInput.focus();
  };

  const closeSearch = () => {
    globalSearchModal.classList.add("hidden");
    globalSearchModal.classList.remove("flex");
    globalSearchInput.value = "";
    globalSearchResults.innerHTML =
      '<div class="text-center text-gray-500 py-10">Digite para pesquisar...</div>';
  };

  closeGlobalSearch.onclick = closeSearch;
  globalSearchModal.onclick = (e) => {
    if (e.target === globalSearchModal) closeSearch();
  };

  let searchTimeout;
  globalSearchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const term = e.target.value.toLowerCase().trim();

    if (!term) {
      globalSearchResults.innerHTML =
        '<div class="text-center text-gray-500 py-10">Digite para pesquisar...</div>';
      return;
    }

    searchTimeout = setTimeout(async () => {
      globalSearchResults.innerHTML =
        '<div class="text-center py-4"><i class="fas fa-circle-notch fa-spin text-indigo-500"></i></div>';

      try {
        const [transactions, tasks, notes] = await Promise.all([
          getTransactions(), // Fetches all (no args)
          getTasks(),
          getNotes(),
        ]);

        const results = {
          transactions: transactions.filter(
            (t) =>
              (t.description && t.description.toLowerCase().includes(term)) ||
              (t.category && t.category.toLowerCase().includes(term))
          ),
          tasks: tasks.filter(
            (t) =>
              (t.title && t.title.toLowerCase().includes(term)) ||
              (t.description && t.description.toLowerCase().includes(term))
          ),
          notes: notes.filter(
            (n) =>
              (n.title && n.title.toLowerCase().includes(term)) ||
              (n.content && n.content.toLowerCase().includes(term))
          ),
        };

        let html = "";

        if (results.tasks.length > 0) {
          html += `<h4 class="font-bold text-gray-500 uppercase text-xs mb-2">Tarefas (${results.tasks.length})</h4><div class="space-y-2 mb-4">`;
          results.tasks.forEach(
            (t) =>
              (html += `<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-blue-500"><h5 class="font-medium dark:text-gray-200">${
                t.title
              }</h5><p class="text-sm text-gray-500 truncate">${
                t.description || ""
              }</p></div>`)
          );
          html += "</div>";
        }

        if (results.notes.length > 0) {
          html += `<h4 class="font-bold text-gray-500 uppercase text-xs mb-2">Notas (${results.notes.length})</h4><div class="space-y-2 mb-4">`;
          results.notes.forEach(
            (n) =>
              (html += `<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-yellow-500"><h5 class="font-medium dark:text-gray-200">${
                n.title || "Sem título"
              }</h5><p class="text-sm text-gray-500 truncate">${
                n.content || ""
              }</p></div>`)
          );
          html += "</div>";
        }

        if (results.transactions.length > 0) {
          html += `<h4 class="font-bold text-gray-500 uppercase text-xs mb-2">Transações (${results.transactions.length})</h4><div class="space-y-2 mb-4">`;
          results.transactions.forEach(
            (t) =>
              (html += `<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 ${
                t.type === "income" ? "border-emerald-500" : "border-red-500"
              } flex justify-between"><div><h5 class="font-medium dark:text-gray-200">${
                t.description || t.category
              }</h5><p class="text-xs text-gray-500">${new Date(
                t.date
              ).toLocaleDateString()}</p></div><span class="font-bold ${
                t.type === "income" ? "text-emerald-600" : "text-red-600"
              }">${t.type === "income" ? "+" : "-"} R$ ${
                t.amount
              }</span></div>`)
          );
          html += "</div>";
        }

        if (!html)
          html =
            '<div class="text-center text-gray-500 py-10">Nenhum resultado encontrado.</div>';
        globalSearchResults.innerHTML = html;
      } catch (e) {
        globalSearchResults.innerHTML =
          '<div class="text-center text-red-500">Erro na busca.</div>';
      }
    }, 500);
  });

  // Render List Helper
  const renderTransactionsList = (txs) => {
    const listEl = element.querySelector("#dashboard-transactions");
    listEl.innerHTML = "";

    if (txs.length === 0) {
      listEl.innerHTML = `<div class="flex flex-col items-center justify-center py-8 text-center">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                <i class="fas fa-receipt text-gray-400 text-2xl"></i>
            </div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Nenhuma transação neste período.</p>
        </div>`;
      return;
    }

    txs.slice(0, 20).forEach((t) => {
      const div = document.createElement("div");
      div.className =
        "flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group";
      div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                  t.type === "income"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-600"
                }">
                    <i class="fas ${
                      t.type === "income" ? "fa-arrow-up" : "fa-arrow-down"
                    } text-xs"></i>
                </div>
                <div>
                    <p class="text-sm font-medium ${
                      t.status === "pending" ? "text-gray-500 line-through" : ""
                    }">${t.description || t.category}</p>
                    <p class="text-xs text-gray-500">${new Date(
                      t.date
                    ).toLocaleDateString("pt-BR")} 
                      ${
                        t.recurrence && t.recurrence !== "none"
                          ? '<i class="fas fa-sync-alt text-[10px] text-indigo-400"></i>'
                          : ""
                      } ${
        t.status === "pending"
          ? '<span class="text-orange-500">(Pendente)</span>'
          : ""
      }</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm font-bold ${
                  t.type === "income" ? "text-emerald-600" : "text-red-600"
                }">${t.type === "income" ? "+" : "-"} ${
        showValues
          ? Number(t.amount).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "•••••"
      }</span>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button class="edit-btn text-blue-500 hover:bg-blue-100 p-1 rounded"><i class="fas fa-pen"></i></button>
                    <button class="del-btn text-red-500 hover:bg-red-100 p-1 rounded"><i class="fas fa-trash"></i></button>
                </div>
            </div>
          `;

      div.querySelector(".del-btn").onclick = async () => {
        showConfirm("Excluir transação?", async () => {
          await deleteTransaction(t.id);
          loadFinancialData();
        });
      };
      div.querySelector(".edit-btn").onclick = () => {
        editForm.id.value = t.id;
        editForm.description.value = t.description;
        editForm.amount.value = t.amount;
        editForm.status.checked = t.status === "paid";
        editModal.classList.remove("hidden");
        editModal.classList.add("flex");
      };
      listEl.appendChild(div);
    });
  };

  // Filter Tabs Logic
  element.querySelectorAll(".filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update UI
      element.querySelectorAll(".filter-tab").forEach((b) => {
        b.className =
          "filter-tab px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors";
      });
      btn.className =
        "filter-tab px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300";

      currentFilterType = btn.dataset.type;
      const term = element.querySelector("#trans-search").value.toLowerCase();
      filterAndRender(term);
    });
  });

  const filterAndRender = (term) => {
    let filtered = currentTransactions.filter(
      (t) =>
        (t.description && t.description.toLowerCase().includes(term)) ||
        (t.category && t.category.toLowerCase().includes(term))
    );
    if (currentFilterType !== "all")
      filtered = filtered.filter((t) => t.type === currentFilterType);
    renderTransactionsList(filtered);
  };

  // Search Listener
  element
    .querySelector("#trans-search")
    .addEventListener("input", (e) =>
      filterAndRender(e.target.value.toLowerCase())
    );

  // Carregar dados reais
  const loadFinancialData = async () => {
    try {
      // Use currentDate state instead of new Date()
      const transactions = await getTransactions(
        currentDate.getMonth(),
        currentDate.getFullYear()
      );
      currentTransactions = transactions; // Update local state
      const { income, expense, total } = calculateBalance(transactions);

      const fmt = (val) =>
        showValues
          ? val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "R$ •••••";

      element.querySelector("#balance-amount").textContent = fmt(total);
      element.querySelector("#income-amount").textContent = fmt(income);
      element.querySelector("#expense-amount").textContent = fmt(expense);

      // Calculate Pending
      const pendingExpense = transactions
        .filter((t) => t.type === "expense" && t.status === "pending")
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

      const pendingIncome = transactions
        .filter((t) => t.type === "income" && t.status === "pending")
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

      element.querySelector("#pending-expense").textContent =
        fmt(pendingExpense);
      element.querySelector("#pending-income").textContent = fmt(pendingIncome);

      // --- Goal Logic ---
      const goal = await getFinancialGoal();
      const currentBalance = total;

      // element.querySelector("#goal-current").textContent = fmt(currentBalance);
      // element.querySelector("#goal-target").textContent = `Meta: ${fmt(goal)}`;

      let progress = 0;
      if (goal > 0) {
        progress = (currentBalance / goal) * 100;
        if (progress < 0) progress = 0;
        if (progress > 100) progress = 100;
      }
      element.querySelector("#goal-progress-bar").style.width = `${progress}%`;
      element.querySelector(
        "#goal-status-text"
      ).textContent = `${progress.toFixed(0)}% da meta (${fmt(goal)})`;

      // --- Chart Logic ---
      const processChartData = (type) =>
        transactions
          .filter((t) => t.type === type)
          .reduce((acc, curr) => {
            const cat = curr.category || "Outros";
            acc[cat] = (acc[cat] || 0) + Number(curr.amount);
            return acc;
          }, {});

      const renderChart = (canvasId, dataObj, colors) => {
        const chartCanvas = element.querySelector("#expenses-chart");
        const canvas = element.querySelector(`#${canvasId}`);
        if (canvas && window.Chart) {
          const labels = Object.keys(dataObj);
          const data = Object.values(dataObj);

          // Destroy old instance if exists to prevent overlay
          const existingChart = Chart.getChart(canvas);
          if (existingChart) existingChart.destroy();

          if (labels.length === 0) {
            // Optional: Show "No Data" message
          } else {
            new Chart(canvas, {
              type: "doughnut",
              data: {
                labels: labels,
                datasets: [
                  {
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 4,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { usePointStyle: true, padding: 20 },
                  },
                },
              },
            });
          }
        }
      };

      const expenseColors = [
        "#EF4444",
        "#F59E0B",
        "#F87171",
        "#B91C1C",
        "#7F1D1D",
        "#FECACA",
      ];
      const incomeColors = [
        "#10B981",
        "#3B82F6",
        "#34D399",
        "#059669",
        "#047857",
        "#D1FAE5",
      ];

      renderChart("expenses-chart", processChartData("expense"), expenseColors);
      renderChart("incomes-chart", processChartData("income"), incomeColors);

      // --- Generate Insights ---
      const insightsContainer = element.querySelector("#insights-container");
      insightsContainer.innerHTML = "";

      // 1. Savings Rate
      if (income > 0) {
        const savingsRate = ((income - expense) / income) * 100;
        let savingsMsg = "";
        let icon = "";
        if (savingsRate > 20) {
          savingsMsg = `Ótimo! Você poupou ${savingsRate.toFixed(
            0
          )}% da sua renda.`;
          icon = "fa-piggy-bank";
        } else if (savingsRate > 0) {
          savingsMsg = `Você poupou ${savingsRate.toFixed(
            0
          )}%. Tente chegar a 20%!`;
          icon = "fa-coins";
        } else {
          savingsMsg = `Atenção: Seus gastos superaram seus ganhos.`;
          icon = "fa-exclamation-triangle";
        }
        insightsContainer.innerHTML += `
              <div class="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div class="flex items-center gap-2 mb-1 font-semibold"><i class="fas ${icon}"></i> Poupança</div>
                  <p class="text-sm opacity-90">${savingsMsg}</p>
              </div>
          `;
      }

      // 2. Top Expense Category
      const expenses = transactions.filter((t) => t.type === "expense");
      if (expenses.length > 0) {
        const catTotals = expenses.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {});
        const topCat = Object.keys(catTotals).reduce((a, b) =>
          catTotals[a] > catTotals[b] ? a : b
        );
        insightsContainer.innerHTML += `
              <div class="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div class="flex items-center gap-2 mb-1 font-semibold"><i class="fas fa-chart-line"></i> Maior Gasto</div>
                  <p class="text-sm opacity-90">Sua maior despesa é com <strong>${topCat}</strong>.</p>
              </div>
          `;
      }

      // 3. Random Tip
      const tips = [
        "Revise suas assinaturas mensais.",
        "Tente a regra 50/30/20.",
        "Defina uma meta de saldo maior.",
        "Evite compras por impulso.",
        "Categorize todos os seus gastos.",
      ];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      insightsContainer.innerHTML += `
          <div class="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <div class="flex items-center gap-2 mb-1 font-semibold"><i class="fas fa-info-circle"></i> Dica</div>
              <p class="text-sm opacity-90">${randomTip}</p>
          </div>
      `;

      // 4. Budget/Top Expenses Logic
      const expensesByCategory = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => {
          const cat = t.category || "Outros";
          acc[cat] = (acc[cat] || 0) + Number(t.amount);
          return acc;
        }, {});

      const sortedCategories = Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4); // Top 4

      const budgetContainer = element.querySelector("#budget-container");
      budgetContainer.innerHTML = "";

      if (sortedCategories.length === 0) {
        budgetContainer.innerHTML =
          '<p class="text-sm text-gray-500 text-center py-2">Nenhuma despesa registrada neste mês.</p>';
      } else {
        sortedCategories.forEach(([cat, amount]) => {
          const percentage = expense > 0 ? (amount / expense) * 100 : 0;
          let colorClass = "bg-emerald-500";
          if (percentage > 40) colorClass = "bg-red-500";
          else if (percentage > 20) colorClass = "bg-orange-500";
          else if (percentage > 10) colorClass = "bg-yellow-500";

          budgetContainer.innerHTML += `
                <div>
                    <div class="flex justify-between items-end mb-1">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"><i class="fas fa-tag text-xs opacity-50"></i> ${cat}</span>
                        <span class="text-xs font-bold text-gray-900 dark:text-white">${fmt(
                          amount
                        )} <span class="text-gray-400 font-normal">(${percentage.toFixed(
            1
          )}%)</span></span>
                    </div>
                    <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div class="${colorClass} h-2 rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
                    </div>
                </div>
              `;
        });
      }

      // --- List Logic ---
      renderTransactionsList(transactions);
      renderCalendar();
    } catch (error) {
      console.error("Erro ao carregar finanças:", error);
    }
  };

  // --- Savings Goals Logic ---
  const goalsContainer = element.querySelector("#goals-container");
  const savingsGoalModal = element.querySelector("#savings-goal-modal");
  const savingsGoalForm = element.querySelector("#savings-goal-form");
  const addGoalBtn = element.querySelector("#add-goal-btn");
  const closeSavingsGoalModal = element.querySelector(
    "#close-savings-goal-modal"
  );
  const goalIconsContainer = element.querySelector("#goal-icons-select");

  const goalIcons = [
    "fa-piggy-bank",
    "fa-plane",
    "fa-car",
    "fa-home",
    "fa-laptop",
    "fa-graduation-cap",
    "fa-gamepad",
    "fa-mobile-alt",
  ];

  // Render Icons Selection
  goalIconsContainer.innerHTML = goalIcons
    .map(
      (icon) => `
      <div class="goal-icon-option w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors ${
        icon === "fa-piggy-bank" ? "ring-2 ring-indigo-500" : ""
      }" data-icon="${icon}">
          <i class="fas ${icon} text-gray-600 dark:text-gray-300"></i>
      </div>
  `
    )
    .join("");

  goalIconsContainer.querySelectorAll(".goal-icon-option").forEach((opt) => {
    opt.onclick = () => {
      goalIconsContainer
        .querySelectorAll(".goal-icon-option")
        .forEach((el) => el.classList.remove("ring-2", "ring-indigo-500"));
      opt.classList.add("ring-2", "ring-indigo-500");
      savingsGoalForm.icon.value = opt.dataset.icon;
    };
  });

  const loadSavingsGoals = async () => {
    if (!user) return;
    goalsContainer.innerHTML =
      '<div class="col-span-full flex justify-center py-4"><i class="fas fa-circle-notch fa-spin text-indigo-500"></i></div>';

    try {
      const q = query(
        collection(db, "savings_goals"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const goals = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      goalsContainer.innerHTML = "";
      if (goals.length === 0) {
        goalsContainer.innerHTML =
          '<p class="text-sm text-gray-500 col-span-full text-center py-2">Nenhuma meta definida. Crie uma agora!</p>';
        return;
      }

      goals.forEach((goal) => {
        const progress = Math.min(
          (goal.currentAmount / goal.targetAmount) * 100,
          100
        );
        const card = document.createElement("div");
        card.className =
          "bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative group";
        card.innerHTML = `
                  <div class="flex justify-between items-start mb-2">
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400">
                              <i class="fas ${goal.icon}"></i>
                          </div>
                          <div>
                              <h4 class="font-bold text-gray-800 dark:text-white text-sm">${
                                goal.title
                              }</h4>
                              <p class="text-xs text-gray-500 dark:text-gray-400">Meta: ${
                                showValues
                                  ? Number(goal.targetAmount).toLocaleString(
                                      "pt-BR",
                                      { style: "currency", currency: "BRL" }
                                    )
                                  : "R$ •••••"
                              }</p>
                          </div>
                      </div>
                      <button class="delete-goal-btn text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" data-id="${
                        goal.id
                      }"><i class="fas fa-trash"></i></button>
                  </div>
                  <div class="flex justify-between items-end mb-1">
                      <span class="text-lg font-bold text-gray-900 dark:text-white">${
                        showValues
                          ? Number(goal.currentAmount).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "R$ •••••"
                      }</span>
                      <span class="text-xs font-medium text-indigo-600 dark:text-indigo-400">${progress.toFixed(
                        0
                      )}%</span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                      <div class="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
                  </div>
                  <button class="absolute inset-0 w-full h-full cursor-pointer z-0 edit-goal-trigger" data-id="${
                    goal.id
                  }"></button>
              `;

        // Edit Trigger
        card.querySelector(".edit-goal-trigger").onclick = () => {
          savingsGoalForm.goalId.value = goal.id;
          savingsGoalForm.title.value = goal.title;
          savingsGoalForm.targetAmount.value = goal.targetAmount;
          savingsGoalForm.currentAmount.value = goal.currentAmount;
          savingsGoalForm.icon.value = goal.icon;

          // Select Icon
          goalIconsContainer
            .querySelectorAll(".goal-icon-option")
            .forEach((el) => {
              el.classList.remove("ring-2", "ring-indigo-500");
              if (el.dataset.icon === goal.icon)
                el.classList.add("ring-2", "ring-indigo-500");
            });

          element.querySelector("#savings-goal-modal-title").textContent =
            "Editar Meta";
          savingsGoalModal.classList.remove("hidden");
          savingsGoalModal.classList.add("flex");
        };

        // Delete Trigger
        card.querySelector(".delete-goal-btn").onclick = (e) => {
          e.stopPropagation();
          showConfirm("Excluir esta meta?", async () => {
            await deleteDoc(doc(db, "savings_goals", goal.id));
            loadSavingsGoals();
          });
        };

        goalsContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading goals:", error);
      if (error.code === "permission-denied") {
        goalsContainer.innerHTML =
          '<p class="text-sm text-red-500 col-span-full text-center">Erro de permissão. Verifique o Firestore Rules.</p>';
      } else {
        goalsContainer.innerHTML =
          '<p class="text-sm text-red-500 col-span-full text-center">Erro ao carregar metas.</p>';
      }
    }
  };

  addGoalBtn.onclick = () => {
    savingsGoalForm.reset();
    savingsGoalForm.goalId.value = "";
    element.querySelector("#savings-goal-modal-title").textContent =
      "Nova Meta";
    savingsGoalModal.classList.remove("hidden");
    savingsGoalModal.classList.add("flex");
  };

  closeSavingsGoalModal.onclick = () => {
    savingsGoalModal.classList.add("hidden");
    savingsGoalModal.classList.remove("flex");
  };

  savingsGoalForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = savingsGoalForm.goalId.value;
    const data = {
      userId: user.uid,
      title: savingsGoalForm.title.value,
      targetAmount: Number(savingsGoalForm.targetAmount.value),
      currentAmount: Number(savingsGoalForm.currentAmount.value),
      icon: savingsGoalForm.icon.value,
    };

    try {
      if (id) {
        await updateDoc(doc(db, "savings_goals", id), data);
      } else {
        await addDoc(collection(db, "savings_goals"), data);
      }
      savingsGoalModal.classList.add("hidden");
      savingsGoalModal.classList.remove("flex");
      loadSavingsGoals();
      showToast("Meta salva com sucesso!");
    } catch (error) {
      console.error(error);
      showToast("Erro ao salvar meta.", "error");
    }
  };

  loadSavingsGoals();

  // --- Share App Card Logic ---
  const shareCard = document.createElement("div");
  shareCard.className =
    "fixed bottom-20 right-4 max-w-xs w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-40 transform transition-all duration-500 translate-y-20 opacity-0 hidden";
  shareCard.innerHTML = `
      <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-2">
              <i class="fas fa-heart text-red-500"></i>
              <h4 class="font-bold text-gray-800 dark:text-white text-sm">Gostando do App?</h4>
          </div>
          <button id="close-share-card" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fas fa-times"></i></button>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Compartilhe com amigos e ajude a comunidade!</p>
      <div class="flex gap-2">
          <button id="share-wa" class="flex-1 bg-[#25D366] text-white py-2 rounded-lg hover:opacity-90 transition-opacity" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
          <button id="share-fb" class="flex-1 bg-[#1877F2] text-white py-2 rounded-lg hover:opacity-90 transition-opacity" title="Facebook"><i class="fab fa-facebook-f"></i></button>
          <button id="share-native" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:opacity-90 transition-opacity" title="Outros / Instagram"><i class="fas fa-share-alt"></i></button>
      </div>
  `;
  element.appendChild(shareCard);

  const checkShareCard = () => {
    const lastShown = localStorage.getItem("share_last_shown");
    const now = Date.now();
    const interval = 3 * 24 * 60 * 60 * 1000; // 3 dias em milissegundos

    // Mostra se nunca foi mostrado ou se passou o intervalo
    if (!lastShown || now - parseInt(lastShown) > interval) {
      setTimeout(() => {
        shareCard.classList.remove("hidden");
        // Força reflow para animação funcionar
        void shareCard.offsetWidth;
        shareCard.classList.remove("translate-y-20", "opacity-0");
        localStorage.setItem("share_last_shown", now.toString());
      }, 3000); // Aparece 3 segundos após carregar o dashboard
    }
  };

  shareCard.querySelector("#close-share-card").onclick = () => {
    shareCard.classList.add("translate-y-20", "opacity-0");
    setTimeout(() => shareCard.classList.add("hidden"), 500);
  };

  const appUrl = window.location.href.split("#")[0]; // URL base do app
  const shareText =
    "Gerencie suas finanças e tarefas com o Se Organiza! Confira:";

  shareCard.querySelector("#share-wa").onclick = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        shareText + " " + appUrl
      )}`,
      "_blank"
    );
  };

  shareCard.querySelector("#share-fb").onclick = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        appUrl
      )}`,
      "_blank"
    );
  };

  shareCard.querySelector("#share-native").onclick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Se Organiza",
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareText + " " + appUrl);
      showToast("Link copiado para a área de transferência!");
    }
  };

  checkShareCard();

  // --- Onboarding Tutorial Logic ---
  const startOnboarding = async () => {
    const steps = [
      {
        title: "Bem-vindo ao Se Organiza! 🚀",
        text: "Seu novo assistente para gestão financeira e pessoal. Vamos fazer um tour rápido para você aproveitar ao máximo?",
        target: null,
      },
      {
        title: "Acesso Rápido ⚡",
        text: "Aqui você encontra atalhos para criar transações, tarefas, notas e acessar vídeos educativos.",
        target: "#quick-actions-grid", // Updated target
      },
      {
        title: "Resumo Financeiro 💰",
        text: "Seu saldo total, receitas e despesas estão aqui. Use o ícone de olho para esconder os valores.",
        target: ".bg-gradient-to-br", // Target the new hero card
      },
      {
        title: "Gráficos e Listas 📊",
        text: "Visualize para onde seu dinheiro está indo e gerencie suas últimas transações aqui.",
        target: "#charts-section", // Updated target
      },
    ];

    let currentStep = 0;

    // Create Overlay
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black/70 z-[100] flex flex-col justify-end sm:justify-center items-center p-4 transition-opacity duration-300 opacity-0";
    overlay.innerHTML = `
          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full relative transform transition-all duration-300 translate-y-10">
              <div class="flex justify-between items-center mb-4">
                  <h3 id="onb-title" class="text-xl font-bold text-indigo-600 dark:text-indigo-400"></h3>
                  <span id="onb-step" class="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"></span>
              </div>
              <p id="onb-text" class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed"></p>
              <div class="flex justify-between items-center">
                  <button id="onb-skip" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium">Pular Tour</button>
                  <button id="onb-next" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/30">Próximo</button>
              </div>
          </div>
      `;
    document.body.appendChild(overlay);

    // Animate In
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      overlay.querySelector("div").classList.remove("translate-y-10");
    });

    const updateStep = async () => {
      const step = steps[currentStep];
      overlay.querySelector("#onb-title").textContent = step.title;
      overlay.querySelector("#onb-text").textContent = step.text;
      overlay.querySelector("#onb-step").textContent = `${currentStep + 1}/${
        steps.length
      }`;
      overlay.querySelector("#onb-next").textContent =
        currentStep === steps.length - 1 ? "Concluir" : "Próximo";

      // Highlight Logic
      document
        .querySelectorAll(".ring-4")
        .forEach((el) =>
          el.classList.remove(
            "ring-4",
            "ring-indigo-500",
            "ring-offset-4",
            "dark:ring-offset-gray-900"
          )
        );

      if (step.target) {
        const targetEl = element.querySelector(step.target);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          targetEl.classList.add(
            "ring-4",
            "ring-indigo-500",
            "ring-offset-4",
            "dark:ring-offset-gray-900"
          );
        }
      }
    };

    const finishOnboarding = async () => {
      document
        .querySelectorAll(".ring-4")
        .forEach((el) =>
          el.classList.remove(
            "ring-4",
            "ring-indigo-500",
            "ring-offset-4",
            "dark:ring-offset-gray-900"
          )
        );
      overlay.classList.add("opacity-0");
      setTimeout(() => overlay.remove(), 300);
      await updateDoc(doc(db, "users", user.uid), {
        onboardingCompleted: true,
      });
    };

    overlay.querySelector("#onb-next").onclick = () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        updateStep();
      } else {
        finishOnboarding();
      }
    };
    overlay.querySelector("#onb-skip").onclick = finishOnboarding;

    updateStep();
  };

  // --- Calendar Logic ---
  const renderCalendar = async () => {
    const calendarGrid = element.querySelector("#calendar-grid");
    if (!calendarGrid) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Days calculation
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Fetch Tasks for this month
    const allTasks = await getTasks();
    const monthTasks = allTasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    // Prepare Data Map
    const dayData = {};

    // Map Transactions
    currentTransactions.forEach((t) => {
      const parts = t.date.split("-"); // YYYY-MM-DD
      const day = parseInt(parts[2]);
      if (!dayData[day]) dayData[day] = { income: 0, expense: 0, tasks: 0 };

      if (t.type === "income") dayData[day].income++;
      else dayData[day].expense++;
    });

    // Map Tasks
    monthTasks.forEach((t) => {
      const d = new Date(t.dueDate);
      const day = d.getDate();
      if (!dayData[day]) dayData[day] = { income: 0, expense: 0, tasks: 0 };
      dayData[day].tasks++;
    });

    let html = "";

    // Empty slots
    for (let i = 0; i < startingDay; i++) {
      html += `<div class="min-h-[60px] bg-gray-50/50 dark:bg-gray-800/30 rounded-lg"></div>`;
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const data = dayData[i];
      const isToday =
        i === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      let indicators = "";
      if (data) {
        if (data.income > 0)
          indicators += `<div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></div>`;
        if (data.expense > 0)
          indicators += `<div class="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm"></div>`;
        if (data.tasks > 0)
          indicators += `<div class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm"></div>`;
      }

      html += `
            <div class="min-h-[60px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-1.5 relative hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group day-cell" data-day="${i}" data-summary="${
        data
          ? `${data.income} Receitas, ${data.expense} Despesas, ${data.tasks} Tarefas`
          : ""
      }">
                <span class="text-xs font-bold ${
                  isToday
                    ? "bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-md"
                    : "text-gray-500 dark:text-gray-400"
                }">${i}</span>
                <div class="flex gap-1 mt-2 flex-wrap content-end px-1">
                    ${indicators}
                </div>
            </div>
        `;
    }

    calendarGrid.innerHTML = html;

    // Add click listeners
    calendarGrid.querySelectorAll(".day-cell").forEach((cell) => {
      cell.onclick = () => {
        const summary = cell.dataset.summary;
        const day = cell.dataset.day;
        if (summary) {
          showToast(`Dia ${day}: ${summary}`, "info");
        }
      };
    });
  };

  loadFinancialData();

  // Check Onboarding Status
  setTimeout(async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && !userDoc.data().onboardingCompleted) {
        startOnboarding();
      }
    } catch (e) {
      console.error(e);
    }
  }, 1000);

  return element;
}
