import { addTransaction, getTransactions } from "../services/finance.js";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "../services/categories.service.js";
import { showToast, showConfirm } from "../utils/ui.js";
import { auth, db, doc, getDoc } from "../services/firebase.js";

export function Finance() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";

  element.innerHTML = `
        <!-- Header -->
        <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-4">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-white">Finanças</h1>
            </div>
            <div class="flex items-center gap-4">
                <button id="export-csv-btn" class="text-gray-500 hover:text-green-600 transition-colors" title="Exportar CSV (Premium)">
                    <i class="fas fa-file-csv text-xl"></i>
                </button>
                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                    <i class="fas fa-adjust text-xl"></i>
                </button>
                <button onclick="window.location.hash='/notifications'" class="text-gray-500 hover:text-indigo-600 transition-colors relative">
                    <i class="fas fa-bell text-xl"></i>
                    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </button>
            </div>
        </header>

        <main class="flex-1 p-4 max-w-3xl mx-auto w-full overflow-y-auto">
            
            <!-- Chart Section -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <h2 class="text-lg font-semibold mb-4">Comparativo Anual</h2>
                <div class="relative h-64 w-full">
                    <canvas id="year-comparison-chart"></canvas>
                </div>
            </div>

            <!-- Form Card -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <h2 class="text-lg font-semibold mb-4">Nova Transação</h2>
                <form id="finance-form" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Type Toggle -->
                        <div class="col-span-2 flex rounded-md shadow-sm" role="group">
                            <button type="button" id="btn-expense" class="type-btn flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-red-700 focus:text-red-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-red-500 dark:focus:text-white">
                                <i class="fas fa-arrow-down mr-2"></i> Despesa
                            </button>
                            <button type="button" id="btn-income" class="type-btn flex-1 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-emerald-700 focus:text-emerald-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-emerald-500 dark:focus:text-white">
                                <i class="fas fa-arrow-up mr-2"></i> Receita
                            </button>
                        </div>
                        <input type="hidden" name="type" id="input-type" value="expense">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Valor (R$)</label>
                            <input type="number" name="amount" step="0.01" required class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Data</label>
                            <input type="date" name="date" required class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Categoria</label>
                        <div class="flex gap-2">
                            <select name="category" id="category-select" class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"></select>
                            <button type="button" id="manage-cats-btn" class="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300" title="Gerenciar Categorias">
                                <i class="fas fa-cog"></i>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Descrição</label>
                        <input type="text" name="description" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Recorrência (Lembrete)</label>
                        <select name="recurrence" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="none">Não repete</option>
                            <option value="monthly">Mensal (Todo mês)</option>
                            <option value="weekly">Semanal (Toda semana)</option>
                        </select>
                    </div>

                    <div class="flex items-center">
                        <input id="status-check" name="status" type="checkbox" checked class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="status-check" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Já foi pago/recebido?</label>
                    </div>

                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                        Adicionar Transação
                    </button>
                </form>
            </div>

            <!-- History List -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">Histórico</h2>
                    <div class="flex gap-2">
                        <select id="filter-month" class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none cursor-pointer"></select>
                        <select id="filter-year" class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none cursor-pointer"></select>
                    </div>
                </div>
                <div id="transactions-list" class="space-y-3">
                    <div class="flex justify-center py-4"><i class="fas fa-circle-notch fa-spin text-indigo-500"></i></div>
                </div>
            </div>

            <!-- Categories Modal -->
            <div id="cats-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold">Gerenciar Categorias</h3>
                        <button id="close-cats-modal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <form id="add-cat-form" class="flex gap-2 mb-4">
                        <input type="text" name="catName" placeholder="Nova categoria..." required class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none text-sm">
                        <button type="submit" class="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"><i class="fas fa-plus"></i></button>
                    </form>

                    <div id="cats-list" class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        <!-- List -->
                    </div>
                </div>
            </div>

            <!-- Premium Upsell Modal -->
            <div id="premium-modal" class="fixed inset-0 bg-black/60 hidden items-center justify-center z-[70] backdrop-blur-sm p-4 fade-in">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
                    <button id="close-premium-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/20 rounded-full p-1 w-8 h-8 flex items-center justify-center transition-colors"><i class="fas fa-times"></i></button>
                    
                    <div class="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center relative overflow-hidden">
                        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <i class="fas fa-crown text-6xl text-white/90 drop-shadow-lg transform -rotate-12"></i>
                    </div>
                    
                    <div class="p-6 text-center">
                        <h3 class="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Recurso Premium</h3>
                        <p class="text-gray-600 dark:text-gray-300 mb-6 text-sm">A exportação para CSV e Excel é exclusiva para membros Premium. Organize-se como um profissional!</p>
                        
                        <ul class="text-left space-y-3 mb-8 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                            <li class="flex items-center gap-2"><i class="fas fa-check text-green-500"></i> Categorias Ilimitadas</li>
                            <li class="flex items-center gap-2"><i class="fas fa-check text-green-500"></i> Exportação de Dados (CSV)</li>
                            <li class="flex items-center gap-2"><i class="fas fa-check text-green-500"></i> Suporte Prioritário</li>
                        </ul>

                        <button onclick="window.location.hash='/plans'" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all">
                            Quero ser Premium por R$ 9,99
                        </button>
                        <button id="dismiss-premium" class="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline">
                            Continuar no plano grátis
                        </button>
                    </div>
                </div>
            </div>
        </main>
    `;

  // Logic
  const form = element.querySelector("#finance-form");
  const btnExpense = element.querySelector("#btn-expense");
  const btnIncome = element.querySelector("#btn-income");
  const inputType = element.querySelector("#input-type");
  const listContainer = element.querySelector("#transactions-list");
  const filterMonth = element.querySelector("#filter-month");
  const filterYear = element.querySelector("#filter-year");

  const exportBtn = element.querySelector("#export-csv-btn");
  const categorySelect = element.querySelector("#category-select");
  const manageCatsBtn = element.querySelector("#manage-cats-btn");
  const catsModal = element.querySelector("#cats-modal");
  const closeCatsModal = element.querySelector("#close-cats-modal");
  const addCatForm = element.querySelector("#add-cat-form");
  const catsList = element.querySelector("#cats-list");

  // Premium Modal Logic
  const premiumModal = element.querySelector("#premium-modal");
  const closePremiumModal = () => {
    premiumModal.classList.add("hidden");
    premiumModal.classList.remove("flex");
  };
  element.querySelector("#close-premium-modal").onclick = closePremiumModal;
  element.querySelector("#dismiss-premium").onclick = closePremiumModal;
  premiumModal.onclick = (e) => {
    if (e.target === premiumModal) closePremiumModal();
  };

  // Populate Filters
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const currentDate = new Date();

  months.forEach((m, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = m;
    if (index === currentDate.getMonth()) option.selected = true;
    filterMonth.appendChild(option);
  });

  const currentYear = currentDate.getFullYear();
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i;
    if (i === currentYear) option.selected = true;
    filterYear.appendChild(option);
  }

  // Export CSV Logic
  exportBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user) return;

    exportBtn.disabled = true;
    const originalHtml = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

    try {
      // Check Premium Status
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isPremium = userDoc.exists() && userDoc.data().isPremium;

      if (!isPremium) {
        premiumModal.classList.remove("hidden");
        premiumModal.classList.add("flex");
        return;
      }

      const m = parseInt(filterMonth.value);
      const y = parseInt(filterYear.value);
      const transactions = await getTransactions(m, y);

      if (transactions.length === 0) {
        showToast("Sem dados para exportar.", "error");
        return;
      }

      const csvRows = [];
      const headers = [
        "Data",
        "Descrição",
        "Categoria",
        "Tipo",
        "Valor",
        "Status",
        "Recorrência",
      ];
      csvRows.push(headers.join(","));

      transactions.forEach((t) => {
        const row = [
          t.date,
          `"${(t.description || "").replace(/"/g, '""')}"`,
          `"${(t.category || "").replace(/"/g, '""')}"`,
          t.type === "income" ? "Receita" : "Despesa",
          t.amount.toFixed(2),
          t.status === "paid" ? "Pago" : "Pendente",
          t.recurrence === "monthly"
            ? "Mensal"
            : t.recurrence === "weekly"
            ? "Semanal"
            : "Não",
        ];
        csvRows.push(row.join(","));
      });

      const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `financas_${m + 1}_${y}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Exportação concluída!");
    } catch (error) {
      console.error(error);
      showToast("Erro ao exportar.", "error");
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerHTML = originalHtml;
    }
  };

  // Set default date to today
  form.date.valueAsDate = new Date();

  // Toggle Type Logic
  const setType = (type) => {
    inputType.value = type;
    if (type === "expense") {
      btnExpense.classList.add(
        "bg-red-50",
        "text-red-700",
        "border-red-200",
        "ring-1",
        "ring-red-200"
      );
      btnExpense.classList.remove(
        "bg-white",
        "text-gray-900",
        "border-gray-200"
      );

      btnIncome.classList.remove(
        "bg-emerald-50",
        "text-emerald-700",
        "border-emerald-200",
        "ring-1",
        "ring-emerald-200"
      );
      btnIncome.classList.add("bg-white", "text-gray-900", "border-gray-200");
    } else {
      btnIncome.classList.add(
        "bg-emerald-50",
        "text-emerald-700",
        "border-emerald-200",
        "ring-1",
        "ring-emerald-200"
      );
      btnIncome.classList.remove(
        "bg-white",
        "text-gray-900",
        "border-gray-200"
      );

      btnExpense.classList.remove(
        "bg-red-50",
        "text-red-700",
        "border-red-200",
        "ring-1",
        "ring-red-200"
      );
      btnExpense.classList.add("bg-white", "text-gray-900", "border-gray-200");
    }
  };

  btnExpense.addEventListener("click", () => setType("expense"));
  btnIncome.addEventListener("click", () => setType("income"));

  filterMonth.addEventListener("change", renderList);
  filterYear.addEventListener("change", renderList);

  setType("expense"); // Init

  // Render List
  async function renderList() {
    const m = parseInt(filterMonth.value);
    const y = parseInt(filterYear.value);
    const chartCanvas = element.querySelector("#year-comparison-chart");

    // Skeleton Loading
    listContainer.innerHTML = Array(5)
      .fill(0)
      .map(
        () => `
        <div class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 animate-pulse">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div class="space-y-2">
                    <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
            <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    `
      )
      .join("");

    try {
      const transactions = await getTransactions(m, y);
      listContainer.innerHTML = "";

      // --- Chart Logic (Yearly) ---
      // Busca todas do ano para o gráfico, independente do mês selecionado no filtro da lista
      const allYearTransactions = await getTransactions(null, y);
      const monthlyData = Array(12)
        .fill(0)
        .map(() => ({ income: 0, expense: 0 }));

      allYearTransactions.forEach((t) => {
        const month = new Date(t.date + "T12:00:00").getMonth();
        if (t.type === "income") monthlyData[month].income += Number(t.amount);
        else monthlyData[month].expense += Number(t.amount);
      });

      if (window.financeChart) window.financeChart.destroy();

      window.financeChart = new Chart(chartCanvas, {
        type: "bar",
        data: {
          labels: months.map((m) => m.substring(0, 3)),
          datasets: [
            {
              label: "Receitas",
              data: monthlyData.map((d) => d.income),
              backgroundColor: "#10B981",
              borderRadius: 4,
            },
            {
              label: "Despesas",
              data: monthlyData.map((d) => d.expense),
              backgroundColor: "#EF4444",
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
          },
          scales: {
            y: { beginAtZero: true, grid: { color: "#37415120" } },
            x: { grid: { display: false } },
          },
        },
      });

      if (transactions.length === 0) {
        listContainer.innerHTML = `<div class="flex flex-col items-center justify-center py-8 text-center">
              <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <i class="fas fa-receipt text-gray-400 text-2xl"></i>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Nenhuma transação neste período.</p>
          </div>`;
        return;
      }

      transactions.forEach((t) => {
        const isExpense = t.type === "expense";
        const colorClass = isExpense ? "text-red-600" : "text-emerald-600";
        const sign = isExpense ? "-" : "+";
        const isPending = t.status === "pending";

        const item = document.createElement("div");
        item.className =
          "flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0";

        item.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center ${
                          isExpense
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-emerald-100 dark:bg-emerald-900/30"
                        }">
                            <i class="fas ${
                              isExpense
                                ? "fa-arrow-down text-red-600"
                                : "fa-arrow-up text-emerald-600"
                            } text-sm"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 dark:text-gray-100">${
                              t.description || t.category
                            }</p>
                            <p class="text-xs text-gray-500 flex items-center gap-2">${new Date(
                              t.date
                            ).toLocaleDateString("pt-BR")} • ${t.category} 
                            ${
                              t.recurrence && t.recurrence !== "none"
                                ? '<i class="fas fa-sync-alt text-indigo-500" title="Recorrente"></i>'
                                : ""
                            }
                            ${
                              isPending
                                ? '<span class="bg-yellow-100 text-yellow-800 text-[10px] font-medium px-1.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">Pendente</span>'
                                : ""
                            }</p>
                        </div>
                    </div>
                    <span class="font-bold ${colorClass}">${sign} ${Number(
          t.amount
        ).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}</span>
                `;
        listContainer.appendChild(item);
      });
    } catch (error) {
      console.error(error);
      listContainer.innerHTML =
        '<p class="text-center text-red-500">Erro ao carregar.</p>';
    }
  }

  // --- Categories Logic ---
  const renderCategories = async () => {
    const categories = await getCategories("finance");

    // Populate Select
    const currentVal = categorySelect.value;
    categorySelect.innerHTML = "";
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    });
    if (
      currentVal &&
      Array.from(categorySelect.options).some((o) => o.value === currentVal)
    ) {
      categorySelect.value = currentVal;
    }

    // Populate Modal List
    catsList.innerHTML = "";
    categories.forEach((c) => {
      if (c.isDefault) return; // Don't allow deleting defaults

      const div = document.createElement("div");
      div.className =
        "flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm";
      div.innerHTML = `
              <span>${c.name}</span>
              <button class="text-red-500 hover:text-red-700" data-id="${c.id}"><i class="fas fa-trash"></i></button>
          `;
      div.querySelector("button").onclick = async () => {
        showConfirm(`Excluir categoria "${c.name}"?`, async () => {
          await deleteCategory(c.id);
          renderCategories();
        });
      };
      catsList.appendChild(div);
    });
  };

  manageCatsBtn.onclick = () => {
    catsModal.classList.remove("hidden");
    catsModal.classList.add("flex");
  };

  closeCatsModal.onclick = () => {
    catsModal.classList.add("hidden");
    catsModal.classList.remove("flex");
  };

  addCatForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = addCatForm.catName.value.trim();
    if (name) {
      try {
        await addCategory(name, "finance");
        addCatForm.reset();
        renderCategories();
      } catch (error) {
        if (error.message === "LIMIT_REACHED") {
          // Custom Toast for Upgrade
          const toast = document.createElement("div");
          toast.className =
            "fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl z-[100] flex flex-col gap-3 animate-fade-in border border-gray-700 max-w-sm";
          toast.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="bg-orange-500/20 p-2 rounded-full text-orange-500"><i class="fas fa-lock"></i></div>
                    <div>
                        <h4 class="font-bold text-sm">Limite Atingido</h4>
                        <p class="text-xs opacity-80">Usuários Free criam até 3 categorias.</p>
                    </div>
                </div>
                <button id="toast-upgrade-btn" class="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-xs font-bold mt-1">
                    Desbloquear Ilimitado 🚀
                </button>
            `;
          document.body.appendChild(toast);
          toast.querySelector("#toast-upgrade-btn").onclick = () => {
            window.location.hash = "/plans";
            toast.remove();
          };
          setTimeout(() => toast.remove(), 5000);
        } else {
          console.error(error);
          showToast("Erro ao adicionar categoria.", "error");
        }
      }
    }
  };

  // Submit Form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;

    submitBtn.disabled = true;
    submitBtn.innerText = "Salvando...";

    const formData = new FormData(form);
    const transaction = {
      type: formData.get("type"),
      amount: formData.get("amount"),
      category: formData.get("category"),
      date: formData.get("date"),
      description: formData.get("description"),
      recurrence: formData.get("recurrence"),
      status: form.status.checked ? "paid" : "pending",
    };

    try {
      await addTransaction(transaction);
      form.reset();
      form.date.valueAsDate = new Date(); // Reset date to today
      setType("expense"); // Reset type
      await renderList();
      showToast("Transação salva!");
    } catch (error) {
      showToast("Erro ao salvar transação", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
    }
  });

  renderList();
  renderCategories();

  return element;
}
