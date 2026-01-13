import {
  addTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
} from "../services/tasks.service.js";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "../services/categories.service.js";
import { showToast, showConfirm } from "../utils/ui.js";

export function Tasks() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative";

  element.innerHTML = `
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div class="flex items-center gap-4">
            <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                <i class="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">Tarefas</h1>
        </div>
        <div class="flex items-center gap-4">
            <button id="new-task-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <i class="fas fa-plus"></i> <span class="hidden sm:inline">Nova</span>
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

      <!-- Kanban Board -->
      <main class="flex-1 p-4 overflow-x-auto">
        <div class="flex flex-col md:flex-row gap-6 min-w-full md:min-w-0 h-full">
            
            <!-- Coluna: Pendente -->
            <div class="flex-1 min-w-[300px] flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 drop-zone transition-all duration-200" data-status="pending">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-yellow-400"></span> Pendente
                    </h3>
                    <span id="count-pending" class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">0</span>
                </div>
                <div id="col-pending" class="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar"></div>
            </div>

            <!-- Coluna: Em Andamento -->
            <div class="flex-1 min-w-[300px] flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 drop-zone transition-all duration-200" data-status="in_progress">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-blue-400"></span> Em Andamento
                    </h3>
                    <span id="count-in_progress" class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">0</span>
                </div>
                <div id="col-in_progress" class="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar"></div>
            </div>

            <!-- Coluna: Concluída -->
            <div class="flex-1 min-w-[300px] flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 drop-zone transition-all duration-200" data-status="done">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-emerald-400"></span> Concluída
                    </h3>
                    <span id="count-done" class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">0</span>
                </div>
                <div id="col-done" class="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar"></div>
            </div>

        </div>
      </main>

      <!-- Modal Nova Tarefa -->
      <div id="task-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-95 opacity-0" id="modal-content">
            <h2 class="text-xl font-bold mb-4">Nova Tarefa</h2>
            <form id="task-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Título</label>
                    <input type="text" name="title" required class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Descrição (Opcional)</label>
                    <textarea name="description" rows="3" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Categoria</label>
                    <div class="flex gap-2">
                        <select name="category" id="task-cat-select" class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="">Sem categoria</option>
                        </select>
                        <button type="button" id="manage-task-cats" class="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><i class="fas fa-cog"></i></button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Etiqueta (Cor)</label>
                    <div class="flex gap-2">
                        <label class="cursor-pointer"><input type="radio" name="color" value="blue" checked class="peer sr-only"><div class="w-6 h-6 rounded-full bg-blue-500 peer-checked:ring-2 ring-offset-2 dark:ring-offset-gray-800"></div></label>
                        <label class="cursor-pointer"><input type="radio" name="color" value="red" class="peer sr-only"><div class="w-6 h-6 rounded-full bg-red-500 peer-checked:ring-2 ring-offset-2 dark:ring-offset-gray-800"></div></label>
                        <label class="cursor-pointer"><input type="radio" name="color" value="green" class="peer sr-only"><div class="w-6 h-6 rounded-full bg-green-500 peer-checked:ring-2 ring-offset-2 dark:ring-offset-gray-800"></div></label>
                        <label class="cursor-pointer"><input type="radio" name="color" value="yellow" class="peer sr-only"><div class="w-6 h-6 rounded-full bg-yellow-500 peer-checked:ring-2 ring-offset-2 dark:ring-offset-gray-800"></div></label>
                        <label class="cursor-pointer"><input type="radio" name="color" value="purple" class="peer sr-only"><div class="w-6 h-6 rounded-full bg-purple-500 peer-checked:ring-2 ring-offset-2 dark:ring-offset-gray-800"></div></label>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Data e Hora de Entrega</label>
                    <input type="datetime-local" name="dueDate" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" id="cancel-btn" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar</button>
                </div>
            </form>
        </div>
      </div>

      <!-- Categories Modal -->
      <div id="cats-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-[60] backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold">Categorias de Tarefas</h3>
                <button id="close-cats-modal" class="text-gray-500"><i class="fas fa-times"></i></button>
            </div>
            <form id="add-cat-form" class="flex gap-2 mb-4">
                <input type="text" name="catName" placeholder="Nova categoria..." required class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none text-sm">
                <button type="submit" class="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"><i class="fas fa-plus"></i></button>
            </form>
            <div id="cats-list" class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar"></div>
        </div>
      </div>
    `;

  // --- Lógica ---
  const modal = element.querySelector("#task-modal");
  const modalContent = element.querySelector("#modal-content");
  const form = element.querySelector("#task-form");

  const catsModal = element.querySelector("#cats-modal");
  const manageCatsBtn = element.querySelector("#manage-task-cats");
  const closeCatsBtn = element.querySelector("#close-cats-modal");
  const addCatForm = element.querySelector("#add-cat-form");
  const catsList = element.querySelector("#cats-list");
  const catSelect = element.querySelector("#task-cat-select");

  // Modal Controls
  const openModal = () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    setTimeout(() => {
      modalContent.classList.remove("scale-95", "opacity-0");
      modalContent.classList.add("scale-100", "opacity-100");
    }, 10);
  };

  const closeModal = () => {
    modalContent.classList.remove("scale-100", "opacity-100");
    modalContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      form.reset();
    }, 200);
  };

  element.querySelector("#new-task-btn").addEventListener("click", openModal);
  element.querySelector("#cancel-btn").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Drag & Drop Logic
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", e.target.dataset.id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => e.target.classList.add("opacity-50"), 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("opacity-50");
    element.querySelectorAll(".drop-zone").forEach((zone) => {
      zone.classList.remove(
        "ring-2",
        "ring-indigo-500",
        "bg-indigo-50",
        "dark:bg-indigo-900/20"
      );
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const zone = e.target.closest(".drop-zone");
    if (zone) {
      e.dataTransfer.dropEffect = "move";
      zone.classList.add(
        "ring-2",
        "ring-indigo-500",
        "bg-indigo-50",
        "dark:bg-indigo-900/20"
      );
    }
  };

  const handleDragLeave = (e) => {
    const zone = e.target.closest(".drop-zone");
    if (zone && !zone.contains(e.relatedTarget)) {
      zone.classList.remove(
        "ring-2",
        "ring-indigo-500",
        "bg-indigo-50",
        "dark:bg-indigo-900/20"
      );
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const zone = e.target.closest(".drop-zone");
    if (zone) {
      zone.classList.remove(
        "ring-2",
        "ring-indigo-500",
        "bg-indigo-50",
        "dark:bg-indigo-900/20"
      );
      const taskId = e.dataTransfer.getData("text/plain");
      const newStatus = zone.dataset.status;

      if (taskId && newStatus) {
        await updateTaskStatus(taskId, newStatus);
        renderTasks();
      }
    }
  };

  element.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
  });

  // Category Logic
  const renderCategories = async () => {
    const cats = await getCategories("task");
    catSelect.innerHTML = '<option value="">Sem categoria</option>';
    catsList.innerHTML = "";

    cats.forEach((c) => {
      // Select
      const opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = c.name;
      catSelect.appendChild(opt);

      // List
      const div = document.createElement("div");
      div.className =
        "flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm";
      div.innerHTML = `<span>${c.name}</span><button class="text-red-500"><i class="fas fa-trash"></i></button>`;
      div.querySelector("button").onclick = () =>
        showConfirm(`Excluir "${c.name}"?`, async () => {
          await deleteCategory(c.id);
          renderCategories();
        });
      catsList.appendChild(div);
    });
  };

  manageCatsBtn.onclick = () => {
    catsModal.classList.remove("hidden");
    catsModal.classList.add("flex");
  };
  closeCatsBtn.onclick = () => {
    catsModal.classList.add("hidden");
    catsModal.classList.remove("flex");
  };

  addCatForm.onsubmit = async (e) => {
    e.preventDefault();
    await addCategory(addCatForm.catName.value, "task");
    addCatForm.reset();
    renderCategories();
  };

  // Render Tasks
  const renderTasks = async () => {
    const cols = {
      pending: element.querySelector("#col-pending"),
      in_progress: element.querySelector("#col-in_progress"),
      done: element.querySelector("#col-done"),
    };

    // Skeleton Loading for Columns
    const skeletonCard = `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    `;
    Object.values(cols).forEach(
      (col) => (col.innerHTML = Array(2).fill(skeletonCard).join(""))
    );

    try {
      const tasks = await getTasks();
      Object.values(cols).forEach((col) => (col.innerHTML = "")); // Limpar loaders

      const counts = { pending: 0, in_progress: 0, done: 0 };

      // Empty States for Columns
      const emptyState = (text) => `
        <div class="text-center py-6 opacity-50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p class="text-sm text-gray-500 dark:text-gray-400">${text}</p>
        </div>
      `;

      tasks.forEach((task) => {
        counts[task.status]++;
        const card = document.createElement("div");
        card.className =
          "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing";
        card.draggable = true;
        card.dataset.id = task.id;
        card.addEventListener("dragstart", handleDragStart);
        card.addEventListener("dragend", handleDragEnd);

        const dateDisplay = task.dueDate
          ? `<div class="text-xs text-gray-500 mt-2 flex items-center gap-1"><i class="far fa-clock"></i> ${new Date(
              task.dueDate
            ).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}</div>`
          : "";

        const colorMap = {
          blue: "bg-blue-500",
          red: "bg-red-500",
          green: "bg-green-500",
          yellow: "bg-yellow-500",
          purple: "bg-purple-500",
        };
        const label = task.category
          ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">${task.category}</span>`
          : "";
        const colorBar = `<div class="w-1 h-full absolute left-0 top-0 rounded-l-lg ${
          colorMap[task.color] || "bg-blue-500"
        }"></div>`;

        // Botões de ação baseados no status
        let actions = "";
        if (task.status === "pending")
          actions += `<button class="move-btn text-blue-500 hover:bg-blue-50 p-1 rounded" data-id="${task.id}" data-to="in_progress" title="Iniciar"><i class="fas fa-play"></i></button>`;
        if (task.status === "in_progress") {
          actions += `<button class="move-btn text-yellow-500 hover:bg-yellow-50 p-1 rounded" data-id="${task.id}" data-to="pending" title="Voltar"><i class="fas fa-undo"></i></button>`;
          actions += `<button class="move-btn text-emerald-500 hover:bg-emerald-50 p-1 rounded" data-id="${task.id}" data-to="done" title="Concluir"><i class="fas fa-check"></i></button>`;
        }
        if (task.status === "done")
          actions += `<button class="move-btn text-yellow-500 hover:bg-yellow-50 p-1 rounded" data-id="${task.id}" data-to="in_progress" title="Reabrir"><i class="fas fa-undo"></i></button>`;

        card.innerHTML = `  
                    ${colorBar}
                    <div class="flex justify-between items-start">
                        <h4 class="font-medium text-gray-900 dark:text-gray-100">${
                          task.title
                        }</h4>
                        <button class="delete-btn text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" data-id="${
                          task.id
                        }"><i class="fas fa-trash"></i></button>
                    </div>
                    ${
                      task.description
                        ? `<p class="text-sm text-gray-500 mt-1 line-clamp-2">${task.description}</p>`
                        : ""
                    }
                    <div class="mt-2">${label}</div>
                    ${dateDisplay}
                    <div class="mt-3 flex justify-end gap-2 border-t pt-2 dark:border-gray-700">
                        ${actions}
                    </div>
                `;

        // Event Listeners para os botões do card
        card.querySelectorAll(".move-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            await updateTaskStatus(btn.dataset.id, btn.dataset.to);
            renderTasks();
          });
        });

        card
          .querySelector(".delete-btn")
          .addEventListener("click", async () => {
            showConfirm("Excluir esta tarefa?", async () => {
              await deleteTask(task.id);
              renderTasks();
              showToast("Tarefa excluída com sucesso", "success");
            });
          });

        cols[task.status].appendChild(card);
      });

      // Apply Empty States if needed
      if (counts.pending === 0)
        cols.pending.innerHTML = emptyState("Sem tarefas pendentes");
      if (counts.in_progress === 0)
        cols.in_progress.innerHTML = emptyState("Nada em andamento");
      if (counts.done === 0)
        cols.done.innerHTML = emptyState("Nenhuma tarefa concluída");

      // Atualizar contadores
      Object.keys(counts).forEach(
        (key) =>
          (element.querySelector(`#count-${key}`).textContent = counts[key])
      );
    } catch (error) {
      console.error(error);
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const task = {
      title: formData.get("title"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
      category: formData.get("category"),
      color: formData.get("color"),
    };

    try {
      await addTask(task);
      closeModal();
      renderTasks();
      showToast("Tarefa criada!");
    } catch (error) {
      showToast("Erro ao criar tarefa", "error");
    }
  });

  renderTasks();
  renderCategories();
  return element;
}
