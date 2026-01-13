import {
  auth,
  db,
  signInWithEmailAndPassword,
  signOut,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  onAuthStateChanged,
  addDoc,
} from "../services/firebase.js";
import { showToast, showConfirm } from "../utils/ui.js";

export function Admin() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";

  let allUsersData = [];
  let currentSection = "dashboard"; // dashboard, users, logs, settings

  // Helper para Logs de Auditoria
  const logAction = async (action, targetUserId, details = {}) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await addDoc(collection(db, "audit_logs"), {
        action,
        targetUserId,
        details,
        adminId: user.uid,
        adminEmail: user.email,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Erro ao registrar log:", e);
    }
  };

  // Função toggleTheme para garantir funcionamento do botão de tema
  window.toggleTheme =
    window.toggleTheme ||
    (() => {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      }
    });

  // --- Renderização do Login ---
  const renderLogin = () => {
    element.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div class="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-700">
          <div class="text-center">
            <div class="mx-auto h-16 w-16 bg-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
              <i class="fas fa-user-shield text-3xl text-white"></i>
            </div>
            <h2 class="text-3xl font-extrabold text-white tracking-tight">Área Restrita</h2>
            <p class="mt-2 text-sm text-gray-400">Acesso exclusivo para administradores.</p>
          </div>
          <form class="mt-8 space-y-6" id="admin-login-form">
            <div class="space-y-4">
              <div>
                <label for="email" class="sr-only">Email</label>
                <input id="email" name="email" type="email" required class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent sm:text-sm" placeholder="Email de Admin">
              </div>
              <div>
                <label for="password" class="sr-only">Senha</label>
                <input id="password" name="password" type="password" required class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent sm:text-sm" placeholder="Senha">
              </div>
            </div>
            <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-lg">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <i class="fas fa-lock group-hover:text-red-200 transition-colors"></i>
              </span>
              Acessar Painel
            </button>
          </form>
          <div class="text-center mt-4">
             <a href="#/login" class="text-sm text-gray-500 hover:text-gray-300">Voltar para o site principal</a>
          </div>
        </div>
      </div>
    `;

    const form = element.querySelector("#admin-login-form");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Login realizado! Carregando...", "success");
      } catch (error) {
        console.error("Admin Login Error:", error);
        let msg = "Erro de autenticação.";
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          msg = "Email ou senha incorretos.";
        } else if (error.code === "auth/too-many-requests") {
          msg = "Muitas tentativas. Tente novamente mais tarde.";
        }
        showToast(msg, "error");
      }
    };
  };

  const renderAccessDenied = () => {
    element.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
        <i class="fas fa-ban text-6xl text-red-500 mb-4"></i>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Acesso Negado</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Seu usuário não tem permissão para acessar este painel.</p>
        <button id="btn-logout-denied" class="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700">Sair</button>
      </div>
    `;
    element.querySelector("#btn-logout-denied").onclick = async () => {
      await signOut(auth);
      window.location.hash = "/login";
    };
  };

  const renderDashboard = () => {
    element.innerHTML = `
        <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <!-- Mobile Overlay -->
            <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-20 hidden transition-opacity opacity-0 md:hidden"></div>

            <!-- Sidebar -->
            <aside id="admin-sidebar" class="fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform -translate-x-full transition-transform duration-300 md:relative md:translate-x-0">
                <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-shield-alt text-indigo-600 text-2xl mr-2"></i>
                    <span class="font-bold text-lg text-gray-800 dark:text-white">Admin Panel</span>
                </div>
                <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
                    <button data-section="dashboard" class="nav-item w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      currentSection === "dashboard"
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }">
                        <i class="fas fa-chart-line w-6"></i> Visão Geral
                    </button>
                    <button data-section="users" class="nav-item w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      currentSection === "users"
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }">
                        <i class="fas fa-users w-6"></i> Usuários
                    </button>
                    <button data-section="logs" class="nav-item w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      currentSection === "logs"
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }">
                        <i class="fas fa-list-alt w-6"></i> Logs do Sistema
                    </button>
                    <button data-section="settings" class="nav-item w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      currentSection === "settings"
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }">
                        <i class="fas fa-cogs w-6"></i> Configurações
                    </button>
                </nav>
                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button id="admin-logout" class="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <i class="fas fa-sign-out-alt w-6"></i> Sair
                    </button>
                </div>
            </aside>

            <!-- Main Content -->
            <div class="flex-1 flex flex-col overflow-hidden">
                <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between z-10">
                    <div class="flex items-center gap-4 md:hidden">
                        <button id="mobile-menu-btn" class="text-gray-500 hover:text-gray-700"><i class="fas fa-bars text-xl"></i></button>
                        <h1 class="text-lg font-bold text-gray-800 dark:text-white">Admin</h1>
                    </div>
                    <div class="hidden md:block">
                        <h2 class="text-xl font-bold text-gray-800 dark:text-white capitalize" id="page-title">${
                          currentSection === "dashboard"
                            ? "Visão Geral"
                            : currentSection
                        }</h2>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">Online</span>
                        <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                            <i class="fas fa-adjust text-xl"></i>
                        </button>
                    </div>
                </header>

                <main class="flex-1 overflow-y-auto p-6" id="main-content-area">
                    <!-- Content injected via JS based on section -->
                    <div class="flex justify-center items-center h-full">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </main>
            </div>
        </div>
    `;

    // Mobile Menu Logic
    const sidebar = element.querySelector("#admin-sidebar");
    const overlay = element.querySelector("#sidebar-overlay");
    const menuBtn = element.querySelector("#mobile-menu-btn");

    const toggleMenu = () => {
      const isClosed = sidebar.classList.contains("-translate-x-full");
      if (isClosed) {
        sidebar.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
        requestAnimationFrame(() => overlay.classList.remove("opacity-0"));
      } else {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("opacity-0");
        setTimeout(() => overlay.classList.add("hidden"), 300);
      }
    };

    if (menuBtn) menuBtn.onclick = toggleMenu;
    if (overlay) overlay.onclick = toggleMenu;

    // Setup Navigation
    element.querySelectorAll(".nav-item").forEach((btn) => {
      btn.onclick = () => {
        currentSection = btn.dataset.section;
        renderDashboard(); // Re-render full layout to update active state
      };
    });

    element.querySelector("#admin-logout").onclick = async () => {
      await signOut(auth);
      window.location.hash = "/login";
    };

    loadSectionContent();
  };

  const loadSectionContent = async () => {
    const container = element.querySelector("#main-content-area");

    if (currentSection === "dashboard" || currentSection === "users") {
      // Carrega dados reais para Dashboard e Users
      await loadRealData(container);
    } else if (currentSection === "logs") {
      await renderLogs(container);
    } else if (currentSection === "settings") {
      renderSettings(container);
    }
  };

  const renderLogs = async (container) => {
    container.innerHTML =
      '<div class="flex justify-center items-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>';

    try {
      const q = query(
        collection(db, "audit_logs"),
        orderBy("timestamp", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map((d) => d.data());

      container.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white">Logs de Auditoria do Sistema</h3>
            <div class="space-y-4">
                ${
                  logs.length > 0
                    ? logs
                        .map(
                          (log) => `
                <div class="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div class="mt-1"><i class="fas fa-history text-indigo-500"></i></div>
                    <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${
                          log.action
                        }</p>
                        <p class="text-xs text-gray-500">Admin: ${
                          log.adminEmail
                        } | Alvo: ${log.targetUserId}</p>
                        <span class="text-xs text-gray-400">${new Date(
                          log.timestamp
                        ).toLocaleString()}</span>
                        ${
                          log.details
                            ? `<div class="text-xs text-gray-400 font-mono mt-1 truncate max-w-md">${JSON.stringify(
                                log.details
                              )}</div>`
                            : ""
                        }
                    </div>
                </div>`
                        )
                        .join("")
                    : '<p class="text-gray-500">Nenhum log encontrado.</p>'
                }
            </div>
        </div>
      `;
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      container.innerHTML = `<p class="text-red-500 p-6">Erro ao carregar logs: ${error.message}</p>`;
      let msg = error.message;
      if (error.code === "permission-denied") {
        msg =
          "Permissão negada. Verifique as regras de segurança do Firestore.";
      }
      container.innerHTML = `<p class="text-red-500 p-6">Erro ao carregar logs: ${msg}</p>`;
    }
  };

  const renderSettings = (container) => {
    container.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 max-w-2xl">
            <h3 class="text-lg font-bold mb-6 text-gray-800 dark:text-white">Configurações Globais</h3>
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-medium text-gray-900 dark:text-white">Manutenção do Sistema</h4>
                        <p class="text-sm text-gray-500">Bloqueia o acesso para todos os usuários exceto admins.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-medium text-gray-900 dark:text-white">Novos Cadastros</h4>
                        <p class="text-sm text-gray-500">Permitir que novos usuários se registrem.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>
        </div>
      `;
  };

  const loadRealData = async (container) => {
    try {
      const [usersSnap, transactionsSnap, tasksSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "transactions")),
        getDocs(collection(db, "tasks")),
      ]);

      const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const transactions = transactionsSnap.docs.map((d) => d.data());
      const tasks = tasksSnap.docs.map((d) => d.data());

      // Process User Stats
      const usersWithStats = users.map((user) => {
        const userTrans = transactions.filter((t) => t.userId === user.id);
        const userTasks = tasks.filter((t) => t.userId === user.id);
        const dates = [
          ...(user.createdAt ? [new Date(user.createdAt)] : []),
          ...userTrans.map((t) => (t.date ? new Date(t.date) : null)),
          ...userTasks.map((t) =>
            t.createdAt || t.date ? new Date(t.createdAt || t.date) : null
          ),
        ]
          .filter(Boolean)
          .map((d) => d.getTime());
        const lastActivity = dates.length > 0 ? Math.max(...dates) : null;
        return {
          ...user,
          transCount: userTrans.length,
          taskCount: userTasks.length,
          lastActivity,
        };
      });

      usersWithStats.sort(
        (a, b) => (b.lastActivity || 0) - (a.lastActivity || 0)
      );
      allUsersData = usersWithStats;

      if (currentSection === "dashboard") {
        renderDashboardContent(container, users, transactions, tasks);
      } else {
        renderUsersContent(container, usersWithStats);
      }
    } catch (error) {
      console.error("Admin Load Error:", error);
      container.innerHTML = `<p class="text-red-500">Erro ao carregar dados: ${error.message}</p>`;
    }
  };

  const renderDashboardContent = (container, users, transactions, tasks) => {
    container.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total de Usuários</p>
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${users.length}</h3>
                </div>
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total de Transações</p>
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${transactions.length}</h3>
                </div>
                 <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Tarefas no Sistema</p>
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${tasks.length}</h3>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Novos Usuários</h2>
                    <div class="relative h-64 w-full">
                        <canvas id="userGrowthChart"></canvas>
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribuição de Planos</h2>
                    <div class="relative h-64 w-full">
                        <canvas id="userDistributionChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
      `;
    renderCharts(users);
  };

  const renderUsersContent = (container, usersList) => {
    container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Gerenciar Usuários</h2>
                    <div class="flex gap-2 w-full sm:w-auto">
                        <input type="text" id="search-users" placeholder="Buscar email ou ID..." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                        <button id="backup-json" class="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800 whitespace-nowrap" title="Backup Completo do Banco de Dados">
                            <i class="fas fa-database mr-2"></i> Backup
                        </button>
                        <button id="export-csv" class="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800 whitespace-nowrap">
                            <i class="fas fa-file-csv mr-2"></i> Exportar
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th class="px-6 py-3">Email</th>
                                <th class="px-6 py-3">Data Cadastro</th>
                                <th class="px-6 py-3 text-center">Transações</th>
                                <th class="px-6 py-3 text-center">Tarefas</th>
                                <th class="px-6 py-3">Última Atividade</th>
                                <th class="px-6 py-3">Plano</th>
                                <th class="px-6 py-3">Validade</th>
                                <th class="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <!-- Rows -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal de Assinatura -->
            <div id="subscription-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
                    <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white">Gerenciar Assinatura</h3>
                    <form id="subscription-form" class="space-y-4">
                        <input type="hidden" name="userId">
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                            <select name="isPremium" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                                <option value="false">Grátis</option>
                                <option value="true">Premium</option>
                            </select>
                        </div>
                        <div id="dates-container" class="space-y-4 hidden">
                            <div>
                                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Data Início</label>
                                <input type="date" name="startDate" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Data Fim (Validade)</label>
                                <input type="date" name="endDate" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                            </div>
                            <div class="flex gap-2 text-xs">
                                <button type="button" class="quick-date px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded" data-days="30">+30 Dias</button>
                                <button type="button" class="quick-date px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded" data-days="365">+1 Ano</button>
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 mt-4">
                            <button type="button" id="close-sub-modal" class="px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded">Cancelar</button>
                            <button type="submit" class="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      `;

    // --- Lógica do Modal de Assinatura ---
    const subModal = element.querySelector("#subscription-modal");
    const subForm = element.querySelector("#subscription-form");
    const datesContainer = element.querySelector("#dates-container");
    const statusSelect = subForm.querySelector("select[name='isPremium']");

    // Toggle visibility of dates based on status
    statusSelect.onchange = () => {
      if (statusSelect.value === "true") {
        datesContainer.classList.remove("hidden");
      } else {
        datesContainer.classList.add("hidden");
      }
    };

    // Quick Date Buttons
    subForm.querySelectorAll(".quick-date").forEach((btn) => {
      btn.onclick = () => {
        const days = parseInt(btn.dataset.days);
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);

        subForm.startDate.valueAsDate = start;
        subForm.endDate.valueAsDate = end;
      };
    });

    element.querySelector("#close-sub-modal").onclick = () => {
      subModal.classList.add("hidden");
      subModal.classList.remove("flex");
    };

    subForm.onsubmit = async (e) => {
      e.preventDefault();
      const uid = subForm.userId.value;
      const isPremium = subForm.isPremium.value === "true";

      const updateData = {
        isPremium: isPremium,
        premiumStartDate: isPremium ? subForm.startDate.value : null,
        premiumEndDate: isPremium ? subForm.endDate.value : null,
      };

      try {
        await updateDoc(doc(db, "users", uid), updateData);
        await logAction("UPDATE_SUBSCRIPTION", uid, updateData);
        showToast("Assinatura atualizada!");
        subModal.classList.add("hidden");
        subModal.classList.remove("flex");
        loadSectionContent(); // Reload
      } catch (error) {
        console.error(error);
        showToast("Erro ao salvar.", "error");
      }
    };

    renderTableRows(usersList);
    setupDashboardListeners();
  };

  const renderTableRows = (usersList) => {
    const usersTable = element.querySelector("#users-table-body");
    if (!usersTable) return;

    if (usersList.length === 0) {
      usersTable.innerHTML =
        '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Nenhum usuário encontrado</td></tr>';
      return;
    }

    usersTable.innerHTML = usersList
      .map((u) => {
        const endDate = u.premiumEndDate ? new Date(u.premiumEndDate) : null;
        const isExpired = endDate && endDate < new Date();
        const statusColor = u.isPremium
          ? isExpired
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800"
          : "bg-gray-200 text-gray-600";

        return `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        ${u.email}
                        <div class="text-xs text-gray-500 font-mono">${
                          u.id
                        }</div>
                    </td>
                    <td class="px-6 py-4">${
                      u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "N/A"
                    }</td>
                    <td class="px-6 py-4 text-center">
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                            ${u.transCount}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                            ${u.taskCount}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-500">
                        ${
                          u.lastActivity
                            ? new Date(u.lastActivity).toLocaleString()
                            : "Sem atividade"
                        }
                    </td>
                    <td class="px-6 py-4">
                        <button class="toggle-premium-btn px-3 py-1 rounded-full text-xs font-bold transition-colors ${statusColor} hover:opacity-80" data-id="${
          u.id
        }" data-premium="${u.isPremium}" data-start="${
          u.premiumStartDate || ""
        }" data-end="${u.premiumEndDate || ""}">
                            ${
                              u.isPremium
                                ? isExpired
                                  ? "Expirado"
                                  : "Premium"
                                : "Grátis"
                            }
                        </button>
                    </td>
                    <td class="px-6 py-4 text-xs text-gray-500">
                        ${endDate ? endDate.toLocaleDateString() : "-"}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end items-center gap-2">
                        <button class="toggle-admin-btn text-yellow-500 hover:text-yellow-600" title="${
                          u.isAdmin ? "Remover Admin" : "Tornar Admin"
                        }" data-id="${u.id}" data-admin="${u.isAdmin || false}">
                            <i class="fas ${
                              u.isAdmin ? "fa-user-shield" : "fa-shield-alt"
                            }"></i>
                        </button>
                        <button class="toggle-suspend-btn text-orange-500 hover:text-orange-600" title="${
                          u.isSuspended ? "Reativar" : "Suspender"
                        }" data-id="${u.id}" data-suspended="${
          u.isSuspended || false
        }">
                            <i class="fas ${
                              u.isSuspended ? "fa-user-check" : "fa-ban"
                            }"></i>
                        </button>
                        <button class="delete-user-btn text-red-600 hover:text-red-800" title="Excluir Dados" data-id="${
                          u.id
                        }">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="view-profile-btn text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium" data-id="${
                          u.id
                        }" title="Ver Detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        </div>
                    </td>
                </tr>
            `;
      })
      .join("");

    // Re-query elements for row listeners
    const subModal = element.querySelector("#subscription-modal");
    const subForm = element.querySelector("#subscription-form");
    const datesContainer = element.querySelector("#dates-container");

    // Open Modal on Click
    usersTable.querySelectorAll(".toggle-premium-btn").forEach((btn) => {
      btn.onclick = () => {
        const uid = btn.dataset.id;
        const isPremium = btn.dataset.premium === "true";

        subForm.userId.value = uid;
        subForm.isPremium.value = isPremium.toString();

        if (isPremium && btn.dataset.start) {
          subForm.startDate.value = btn.dataset.start;
          subForm.endDate.value = btn.dataset.end;
          datesContainer.classList.remove("hidden");
        } else {
          subForm.startDate.valueAsDate = new Date();
          // Default +30 days
          const d = new Date();
          d.setDate(d.getDate() + 30);
          subForm.endDate.valueAsDate = d;
          datesContainer.classList.add("hidden"); // Hidden initially if free
          if (isPremium) datesContainer.classList.remove("hidden");
        }

        subModal.classList.remove("hidden");
        subModal.classList.add("flex");
      };
    });

    // Add Event Listeners for View Profile
    usersTable.querySelectorAll(".view-profile-btn").forEach((btn) => {
      btn.onclick = () => {
        showUserDetails(btn.dataset.id);
      };
    });

    // Toggle Admin
    usersTable.querySelectorAll(".toggle-admin-btn").forEach((btn) => {
      btn.onclick = async () => {
        const uid = btn.dataset.id;
        const isAdmin = btn.dataset.admin === "true";
        try {
          await updateDoc(doc(db, "users", uid), { isAdmin: !isAdmin });
          await logAction(isAdmin ? "REMOVE_ADMIN" : "MAKE_ADMIN", uid, {
            newValue: !isAdmin,
          });
          showToast(isAdmin ? "Admin removido" : "Usuário agora é Admin");
          loadSectionContent();
        } catch (e) {
          console.error(e);
          showToast("Erro ao atualizar permissão", "error");
        }
      };
    });

    // Toggle Suspend
    usersTable.querySelectorAll(".toggle-suspend-btn").forEach((btn) => {
      btn.onclick = async () => {
        const uid = btn.dataset.id;
        const isSuspended = btn.dataset.suspended === "true";
        try {
          await updateDoc(doc(db, "users", uid), { isSuspended: !isSuspended });
          await logAction(
            isSuspended ? "REACTIVATE_USER" : "SUSPEND_USER",
            uid,
            { newValue: !isSuspended }
          );
          showToast(isSuspended ? "Usuário reativado" : "Usuário suspenso");
          loadSectionContent();
        } catch (e) {
          console.error(e);
          showToast("Erro ao atualizar status", "error");
        }
      };
    });

    // Delete User Data
    usersTable.querySelectorAll(".delete-user-btn").forEach((btn) => {
      btn.onclick = () => {
        const uid = btn.dataset.id;
        showConfirm(
          "Excluir dados deste usuário? A conta de login permanecerá (Limitação Spark).",
          async () => {
            try {
              await deleteDoc(doc(db, "users", uid));
              await logAction("DELETE_USER_DATA", uid);
              showToast("Dados do usuário excluídos");
              loadSectionContent();
            } catch (e) {
              console.error(e);
              showToast("Erro ao excluir dados", "error");
            }
          }
        );
      };
    });
  };

  const setupDashboardListeners = () => {
    const searchInput = element.querySelector("#search-users");
    if (searchInput) {
      searchInput.addEventListener("keyup", (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allUsersData.filter(
          (u) =>
            (u.email && u.email.toLowerCase().includes(term)) ||
            (u.id && u.id.toLowerCase().includes(term))
        );
        renderTableRows(filtered);
      });
    }

    const exportBtn = element.querySelector("#export-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const headers = [
          "ID",
          "Email",
          "Data Cadastro",
          "Transações",
          "Tarefas",
          "Última Atividade",
          "Premium",
        ];
        const rows = allUsersData.map((u) => [
          u.id,
          u.email,
          u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
          u.transCount,
          u.taskCount,
          u.lastActivity ? new Date(u.lastActivity).toLocaleString() : "",
          u.isPremium ? "Sim" : "Não",
        ]);

        const csvContent =
          "data:text/csv;charset=utf-8," +
          headers.join(",") +
          "\n" +
          rows.map((e) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "usuarios_se_organiza.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }

    const backupBtn = element.querySelector("#backup-json");
    if (backupBtn) {
      backupBtn.addEventListener("click", async () => {
        const originalText = backupBtn.innerHTML;
        backupBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-2"></i> Gerando...';
        backupBtn.disabled = true;

        try {
          const collections = [
            "users",
            "transactions",
            "tasks",
            "notes",
            "savings_goals",
            "categories",
          ];
          const backupData = {};

          for (const colName of collections) {
            const snap = await getDocs(collection(db, colName));
            backupData[colName] = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
          }

          const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(backupData, null, 2));
          const downloadAnchorNode = document.createElement("a");
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute(
            "download",
            `backup_se_organiza_${new Date().toISOString().split("T")[0]}.json`
          );
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
        } catch (error) {
          console.error("Backup error:", error);
          showToast("Erro ao gerar backup.", "error");
        } finally {
          backupBtn.innerHTML = originalText;
          backupBtn.disabled = false;
        }
      });
    }
  };

  const renderCharts = async (users) => {
    if (!window.Chart) {
      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    // Growth Chart
    const ctx = element.querySelector("#userGrowthChart").getContext("2d");

    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString("pt-BR", { month: "short" });
      // Capitalize first letter
      labels.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));

      const count = users.filter((u) => {
        if (!u.createdAt) return false;
        const uDate = new Date(u.createdAt);
        return (
          uDate.getMonth() === d.getMonth() &&
          uDate.getFullYear() === d.getFullYear()
        );
      }).length;
      data.push(count);
    }

    new window.Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Novos Usuários",
            data: data,
            borderColor: "#4F46E5",
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    // Distribution Chart
    const ctxPie = element
      .querySelector("#userDistributionChart")
      .getContext("2d");
    const premiumCount = users.filter((u) => u.isPremium).length;
    const freeCount = users.length - premiumCount;

    new window.Chart(ctxPie, {
      type: "doughnut",
      data: {
        labels: ["Premium", "Grátis"],
        datasets: [
          {
            data: [premiumCount, freeCount],
            backgroundColor: ["#F59E0B", "#9CA3AF"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  };

  const showUserDetails = async (userId) => {
    const main = element.querySelector("#main-content-area");
    main.innerHTML =
      '<div class="flex justify-center items-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>';

    try {
      const [userDoc, transSnap, tasksSnap] = await Promise.all([
        getDoc(doc(db, "users", userId)),
        getDocs(
          query(
            collection(db, "transactions"),
            where("userId", "==", userId),
            orderBy("date", "desc"),
            limit(50)
          )
        ),
        getDocs(query(collection(db, "tasks"), where("userId", "==", userId))),
      ]);

      if (!userDoc.exists()) {
        showToast("Usuário não encontrado", "error");
        loadSectionContent();
        return;
      }

      const user = { id: userDoc.id, ...userDoc.data() };
      const transactions = transSnap.docs.map((d) => d.data());
      const tasks = tasksSnap.docs.map((d) => d.data());

      const formatCurrency = (val) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(val);
      const balance = transactions.reduce(
        (acc, t) =>
          t.type === "income" ? acc + Number(t.amount) : acc - Number(t.amount),
        0
      );

      main.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="flex items-center gap-4 mb-6">
                    <button id="back-to-dashboard" class="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <i class="fas fa-arrow-left text-xl"></i> <span class="text-sm font-medium">Voltar</span>
                    </button>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Detalhes do Usuário</h2>
                </div>

                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-indigo-500 flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${
                          user.email
                        }</h3>
                        <p class="text-sm text-gray-500 font-mono mt-1">UID: ${
                          user.id
                        }</p>
                        <p class="text-sm text-gray-500 mt-1">Cadastrado: ${
                          user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"
                        }</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-bold ${
                      user.isPremium
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-200 text-gray-600"
                    }">
                        ${user.isPremium ? "Premium" : "Grátis"}
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                        <p class="text-sm text-gray-500">Total Transações</p>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${
                          transactions.length
                        }</h3>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                        <p class="text-sm text-gray-500">Saldo Estimado</p>
                        <h3 class="text-2xl font-bold ${
                          balance >= 0 ? "text-emerald-600" : "text-red-600"
                        }">
                            ${formatCurrency(balance)}
                        </h3>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                        <p class="text-sm text-gray-500">Total Tarefas</p>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${
                          tasks.length
                        }</h3>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Últimas Transações</h3>
                    </div>
                    <div class="overflow-x-auto max-h-96">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th class="px-6 py-3">Data</th>
                                    <th class="px-6 py-3">Descrição</th>
                                    <th class="px-6 py-3">Categoria</th>
                                    <th class="px-6 py-3">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${
                                  transactions.length
                                    ? transactions
                                        .map(
                                          (t) => `
                                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td class="px-6 py-4">${new Date(
                                          t.date
                                        ).toLocaleDateString()}</td>
                                        <td class="px-6 py-4">${
                                          t.description || "-"
                                        }</td>
                                        <td class="px-6 py-4">${t.category}</td>
                                        <td class="px-6 py-4 font-medium ${
                                          t.type === "income"
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                        }">
                                            ${
                                              t.type === "income" ? "+" : "-"
                                            } ${formatCurrency(t.amount)}
                                        </td>
                                    </tr>
                                `
                                        )
                                        .join("")
                                    : '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Nenhuma transação encontrada</td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Tarefas</h3>
                    </div>
                    <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${
                          tasks.length
                            ? tasks
                                .map(
                                  (t) => `
                            <div class="p-4 border rounded-lg dark:border-gray-700 ${
                              t.status === "completed"
                                ? "bg-green-50 dark:bg-green-900/20"
                                : "bg-white dark:bg-gray-800"
                            }">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="text-xs font-semibold px-2 py-1 rounded ${
                                      t.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-blue-100 text-blue-800"
                                    }">
                                        ${
                                          t.status === "completed"
                                            ? "Concluída"
                                            : "Pendente"
                                        }
                                    </span>
                                    <span class="text-xs text-gray-500">${
                                      t.date
                                        ? new Date(t.date).toLocaleDateString()
                                        : ""
                                    }</span>
                                </div>
                                <p class="font-medium text-gray-800 dark:text-white truncate">${
                                  t.title
                                }</p>
                            </div>
                        `
                                )
                                .join("")
                            : '<p class="text-gray-500 col-span-full text-center">Nenhuma tarefa encontrada</p>'
                        }
                    </div>
                </div>
            </div>
        `;

      element.querySelector("#back-to-dashboard").onclick = loadSectionContent;
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      showToast("Erro ao carregar detalhes do usuário.", "error");
    }
  };

  const checkAuth = () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Super Admin Bypass para seu ID
        if (user.uid === "Z32Qc1LfgkTTUh0AfTi7f5ir0Go2") {
          renderDashboard();
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) {
            renderDashboard();
          } else {
            renderAccessDenied();
          }
        } catch (error) {
          console.error("Auth check error:", error);
          renderAccessDenied();
        }
      } else {
        renderLogin();
      }
    });
  };

  checkAuth();
  return element;
}
