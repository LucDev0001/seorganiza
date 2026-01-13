import { getNotes, saveNote, deleteNote } from "../services/notes.service.js";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "../services/categories.service.js";
import { showToast, showConfirm } from "../utils/ui.js";

export function Notes() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300";

  // Ícones SVG inline
  const icons = {
    search: '<i class="fas fa-search"></i>',
    back: '<i class="fas fa-arrow-left"></i>',
    close: '<i class="fas fa-times"></i>',
    palette: '<i class="fas fa-palette"></i>',
    trash: '<i class="fas fa-trash-alt"></i>',
    copy: '<i class="fas fa-copy"></i>',
    check: '<i class="fas fa-check"></i>',
    plus: '<i class="fas fa-plus"></i>',
    cog: '<i class="fas fa-cog"></i>',
    bell: '<i class="fas fa-bell"></i>',
    theme: '<i class="fas fa-adjust"></i>',
    edit: '<i class="fas fa-pen"></i>', // Ícone de Edição (Lápis)
    empty:
      '<i class="far fa-sticky-note text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>',
  };

  element.innerHTML = `
        <!-- Header -->
        <header class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95">
                    ${icons.back}
                </button>
                <h1 class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Notas</h1>
            </div>
            
            <div class="flex items-center gap-2">
                <!-- Mobile Search -->
                <button id="mobile-search-btn" class="sm:hidden text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    ${icons.search}
                </button>
                
                <!-- Desktop Search -->
                <div class="relative hidden sm:block group">
                    <input type="text" id="search-notes" placeholder="Pesquisar..." class="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-800 border focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-4 focus:ring-indigo-500/10 w-64 text-sm outline-none transition-all duration-300">
                    <span class="absolute left-3.5 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        ${icons.search}
                    </span>
                </div>

                <div class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block"></div>

                <!-- Theme Toggle (Restaurado) -->
                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    ${icons.theme}
                </button>

                <button onclick="window.location.hash='/notifications'" class="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    ${icons.bell}
                    <span class="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-2.5 w-2.5 border-2 border-white dark:border-gray-800"></span>
                </button>
            </div>
        </header>

        <!-- Mobile Search Overlay -->
        <div id="mobile-search-overlay" class="fixed inset-0 bg-white dark:bg-gray-900 z-[60] hidden flex-col">
            <div class="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                <button id="close-mobile-search" class="text-gray-500 p-2">${icons.back}</button>
                <input type="text" id="mobile-search-input" placeholder="Pesquisar..." class="flex-1 bg-transparent border-none text-lg outline-none text-gray-800 dark:text-white">
            </div>
        </div>

        <main class="flex-1 p-4 sm:p-8 overflow-y-auto custom-scrollbar relative">
            
            <!-- Create Note Area -->
            <div class="max-w-2xl mx-auto mb-10 relative z-10">
                <div id="create-note-container" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 overflow-hidden">
                    
                    <!-- Collapsed State -->
                    <div id="create-note-collapsed" class="flex justify-between items-center p-4 cursor-text">
                        <span class="text-gray-500 dark:text-gray-400 font-medium ml-1">Criar uma nota...</span>
                        <div class="text-gray-400">${icons.plus}</div>
                    </div>

                    <!-- Expanded State -->
                    <div id="create-note-expanded" class="hidden flex-col">
                        <input type="text" id="new-note-title" placeholder="Título" class="w-full bg-transparent px-5 pt-5 pb-2 font-bold text-lg text-gray-900 dark:text-white outline-none placeholder-gray-400">
                        
                        <textarea id="new-note-content" placeholder="Escreva sua nota..." rows="3" class="w-full bg-transparent px-5 py-2 resize-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-base"></textarea>
                        
                        <!-- Footer Actions -->
                        <div class="flex flex-col sm:flex-row justify-between items-center px-4 py-3 gap-3">
                            <div class="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1 hide-scrollbar" id="color-picker-container"></div>
                            
                            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <select id="new-note-cat" class="bg-gray-100 dark:bg-gray-700/50 text-xs font-medium py-1.5 px-3 rounded-full border-none outline-none text-gray-600 dark:text-gray-300 cursor-pointer">
                                    <option value="">Sem etiqueta</option>
                                </select>
                                
                                <button id="close-create-note" class="text-sm font-semibold px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all">
                                    Salvar
                                </button>
                            </div>
                        </div>
                        
                        <!-- Shortcut for Cats -->
                        <button id="manage-note-cats-btn" class="absolute top-4 right-4 text-gray-400 hover:text-indigo-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                            ${icons.cog}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Notes Grid -->
            <div id="notes-grid" class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 pb-20 mx-auto max-w-7xl"></div>
            
            <!-- Empty State -->
            <div id="empty-state" class="hidden flex-col items-center justify-center mt-20 opacity-0 transition-opacity duration-500">
                ${icons.empty}
                <p class="text-gray-500 dark:text-gray-400 font-medium">Suas notas aparecerão aqui</p>
                <button id="create-note-trigger" class="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">Criar nova nota</button>
            </div>
        </main>

        <!-- Edit Modal -->
        <div id="edit-modal" class="fixed inset-0 z-[100] hidden" aria-hidden="true">
            <div id="edit-modal-backdrop" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity opacity-0"></div>
            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 sm:p-0">
                    <div id="edit-modal-content" class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all sm:my-8 w-full sm:max-w-xl md:max-w-2xl opacity-0 scale-95 flex flex-col max-h-[85vh]">
                        <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
                            <input type="text" id="edit-note-title" placeholder="Título" class="w-full bg-transparent font-bold text-2xl mb-4 outline-none text-gray-900 dark:text-gray-100">
                            <textarea id="edit-note-content" placeholder="Nota" class="w-full bg-transparent resize-none outline-none text-gray-700 dark:text-gray-300 text-lg min-h-[200px]"></textarea>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-800/80 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-700">
                            <div class="flex items-center gap-2 overflow-x-auto w-full sm:w-auto" id="edit-color-picker"></div>
                            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <div class="flex items-center">
                                    <select id="edit-note-cat" class="bg-transparent text-xs font-medium text-gray-500 dark:text-gray-400 outline-none cursor-pointer mr-2">
                                        <option value="">Sem categoria</option>
                                    </select>
                                    <span id="save-status" class="text-xs font-medium text-green-500 opacity-0 transition-opacity flex items-center gap-1">
                                        ${icons.check} Salvo
                                    </span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <button id="copy-note-btn" class="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors">${icons.copy}</button>
                                    <!-- O botão de delete do modal agora chama a função de delete usando o ID global -->
                                    <button id="delete-note-modal-btn" class="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">${icons.trash}</button>
                                    <button id="close-modal-btn" class="ml-2 px-5 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all">Concluir</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Categories Modal -->
        <div id="cats-modal" class="fixed inset-0 z-[110] hidden items-center justify-center p-4">
            <div id="cats-modal-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform relative z-10">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">Etiquetas</h3>
                    <button id="close-cats-modal" class="text-gray-400 hover:text-gray-600">${icons.close}</button>
                </div>
                <form id="add-cat-form" class="flex gap-2 mb-6">
                    <input type="text" name="catName" placeholder="Nova etiqueta..." required class="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-2.5 outline-none text-sm">
                    <button type="submit" class="bg-indigo-600 text-white px-3.5 py-2 rounded-xl hover:bg-indigo-700">${icons.plus}</button>
                </form>
                <div id="cats-list" class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar"></div>
            </div>
        </div>
    `;

  // --- Logic & Data ---

  const colors = [
    "white",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "darkblue",
    "purple",
    "pink",
    "brown",
    "gray",
  ];

  const colorMap = {
    white: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    red: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/50",
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/50",
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50",
    teal: "bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/50",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50",
    darkblue:
      "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/50",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50",
    pink: "bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800/50",
    brown:
      "bg-stone-50 dark:bg-stone-900/20 border-stone-100 dark:border-stone-800/50",
    gray: "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600",
  };

  const btnColorMap = {
    white: "#ffffff",
    red: "#fca5a5",
    orange: "#fdba74",
    yellow: "#fde047",
    green: "#86efac",
    teal: "#5eead4",
    blue: "#93c5fd",
    darkblue: "#a5b4fc",
    purple: "#d8b4fe",
    pink: "#f9a8d4",
    brown: "#d6d3d1",
    gray: "#e5e7eb",
  };

  // --- Safe Selectors (Proteção contra null) ---
  const $ = (selector) => element.querySelector(selector);

  // State
  let notes = [];
  let currentNoteId = null; // ID da nota atualmente no modal de edição
  let currentColor = "white"; // Estado para cor da nota a ser criada/editada
  let autoSaveTimer = null;

  // --- Helper Functions ---
  const renderColorPicker = (container, onClick, selected) => {
    if (!container) return; // Segurança
    container.innerHTML = "";
    colors.forEach((color) => {
      const btn = document.createElement("button");
      const isSelected = selected === color;

      btn.className = `w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 dark:border-gray-600 transition-all duration-200 flex items-center justify-center relative flex-shrink-0 mx-0.5 ${
        isSelected
          ? "ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-800 scale-110"
          : "hover:scale-110"
      }`;
      btn.style.backgroundColor = btnColorMap[color];

      if (isSelected) {
        btn.innerHTML = `<i class="fas fa-check text-[10px] sm:text-xs text-gray-800"></i>`;
      }

      btn.onclick = (e) => {
        e.stopPropagation();
        onClick(color);
      };
      container.appendChild(btn);
    });
  };

  /**
   * Atualiza a cor do container de criação e o estado global `currentColor`.
   * @param {string} color
   */
  const updateCreateContainerColor = (color) => {
    currentColor = color;
    const container = $("#create-note-container");
    if (!container) return;

    const classesToRemove = Object.values(colorMap).join(" ").split(" ");
    container.classList.remove(...classesToRemove);

    const newClasses = (colorMap[color] || colorMap.white).split(" ");
    container.classList.add(...newClasses);

    renderColorPicker(
      $("#color-picker-container"),
      updateCreateContainerColor,
      currentColor
    );
  };

  const updateEditModalColor = (color) => {
    currentColor = color;
    const content = $("#edit-modal-content");
    if (!content) return;

    const classesToRemove = Object.values(colorMap).join(" ").split(" ");
    content.classList.remove(...classesToRemove);

    const newClasses = (colorMap[color] || colorMap.white).split(" ");
    content.classList.add(...newClasses);

    renderColorPicker(
      $("#edit-color-picker"),
      (c) => {
        updateEditModalColor(c);
        triggerAutoSave();
      },
      currentColor
    );
  };

  const handleDeleteNote = (noteId) => {
    console.log("Delete triggered for ID:", noteId);
    showConfirm("Excluir esta nota?", async () => {
      if (noteId) {
        try {
          await deleteNote(noteId);
          // Se o modal estiver aberto, feche-o.
          if (noteId === currentNoteId) {
            closeEditModal(false); // Não recarrega, pois loadNotes() já será chamado abaixo
          }
          showToast("Nota excluída", "success");
          loadNotes(); // Recarrega as notas na grade
        } catch (error) {
          console.error("ERRO AO EXCLUIR NOTA:", error);
          showToast(
            "Erro ao excluir nota. Verifique o console para detalhes.",
            "error"
          );
        }
      } else {
        console.warn("Delete aborted: Note ID is missing.");
        showToast("Erro: ID da nota não foi carregado para exclusão.", "error");
      }
    });
  };

  const renderNotes = () => {
    const grid = $("#notes-grid");
    const emptyState = $("#empty-state");
    const searchVal = $("#search-notes")?.value || "";
    const mobileSearchVal = $("#mobile-search-input")?.value || "";
    const term = (searchVal || mobileSearchVal).toLowerCase();

    if (!grid || !emptyState) return;
    grid.innerHTML = "";

    const safeNotes = Array.isArray(notes) ? notes : [];

    const filtered = safeNotes.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(term)) ||
        (n.content && n.content.toLowerCase().includes(term))
    );

    if (filtered.length === 0) {
      emptyState.classList.remove("hidden");
      setTimeout(() => emptyState.classList.remove("opacity-0"), 10);
      return;
    }

    emptyState.classList.add("hidden", "opacity-0");

    filtered.forEach((note) => {
      const card = document.createElement("div");
      const bgClass = colorMap[note.color] || colorMap.white;

      // Remove o cursor-pointer e o hover de -translate-y para evitar a interação no card principal
      card.className = `${bgClass} p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 break-inside-avoid mb-4 group relative border`;

      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            ${
              note.title
                ? `<h3 class="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-2">${note.title}</h3>`
                : "<span></span>"
            }
        </div>
        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed line-clamp-[8] font-medium">${
          note.content || '<span class="italic text-gray-400">Nota vazia</span>'
        }</p>
        
        <div class="mt-4 flex items-center justify-between min-h-[24px]">
             ${
               note.category
                 ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 uppercase tracking-wide border border-black/5 dark:border-white/5">${note.category}</span>`
                 : "<span></span>"
             }
             
             <!-- Action Buttons: Visíveis permanentemente -->
             <div class="flex items-center gap-1">
                 <button class="edit-note-btn p-1.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-id="${
                   note.id
                 }" title="Editar Nota">
                     ${icons.edit}
                 </button>
                 <button class="delete-note-card-btn p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" data-id="${
                   note.id
                 }" title="Excluir Nota">
                     ${icons.trash}
                 </button>
             </div>
        </div>
      `;

      // 1. Ouvinte para abrir o modal de edição (apenas no lápis)
      card.querySelector(".edit-note-btn")?.addEventListener("click", (e) => {
        e.stopPropagation(); // Evita qualquer propagação indesejada
        openEditModal(note);
      });

      // 2. Ouvinte para exclusão (apenas na lixeira)
      card
        .querySelector(".delete-note-card-btn")
        ?.addEventListener("click", (e) => {
          e.stopPropagation(); // Essencial para evitar o bug de fechar modais
          handleDeleteNote(note.id);
        });

      grid.appendChild(card);
    });
  };

  const loadNotes = async () => {
    const grid = $("#notes-grid");
    if (grid) {
      // Skeleton Loading
      grid.innerHTML = Array(6)
        .fill(0)
        .map(
          () => `
            <div class="break-inside-avoid mb-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div class="space-y-2">
                    <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            </div>
        `
        )
        .join("");
    }

    try {
      const result = await getNotes();
      notes = Array.isArray(result) ? result : []; // Garante que é array
      renderNotes();
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
      notes = []; // Fallback para array vazio
      renderNotes();
      showToast("Erro ao carregar notas", "error");
    }
  };

  // --- Category Logic (Mantido inalterado) ---
  const renderCategories = async () => {
    const newSelect = $("#new-note-cat");
    const editSelect = $("#edit-note-cat");
    const list = $("#cats-list");

    try {
      const cats = (await getCategories("note")) || [];

      const populate = (sel) => {
        if (!sel) return;
        const val = sel.value;
        sel.innerHTML = '<option value="">Sem etiqueta</option>';
        cats.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = c.name;
          opt.textContent = c.name;
          sel.appendChild(opt);
        });
        sel.value = val;
      };

      populate(newSelect);
      populate(editSelect);

      if (list) {
        list.innerHTML = "";
        if (cats.length === 0) {
          list.innerHTML =
            '<div class="text-center text-gray-400 text-sm py-4 italic">Nenhuma etiqueta criada</div>';
        }
        cats.forEach((c) => {
          const div = document.createElement("div");
          div.className =
            "flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-xl text-sm transition-colors group";
          div.innerHTML = `
                <span class="font-medium text-gray-700 dark:text-gray-200"><i class="fas fa-tag text-gray-400 mr-2 text-xs"></i>${c.name}</span>
                <button class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"><i class="fas fa-trash-alt"></i></button>`;

          div.querySelector("button").onclick = () =>
            showConfirm(`Excluir etiqueta "${c.name}"?`, async () => {
              await deleteCategory(c.id);
              renderCategories();
            });
          list.appendChild(div);
        });
      }
    } catch (e) {
      console.error("Erro categorias:", e);
    }
  };

  // --- Events Binding (Com Safety Checks) ---

  // Mobile Search
  const mobileSearchBtn = $("#mobile-search-btn");
  if (mobileSearchBtn) {
    mobileSearchBtn.onclick = () => {
      $("#mobile-search-overlay")?.classList.remove("hidden");
      $("#mobile-search-overlay")?.classList.add("flex");
      const deskInput = $("#search-notes");
      const mobInput = $("#mobile-search-input");
      if (mobInput && deskInput) mobInput.value = deskInput.value;
      mobInput?.focus();
    };
  }

  $("#close-mobile-search")?.addEventListener("click", () => {
    $("#mobile-search-overlay")?.classList.remove("flex");
    $("#mobile-search-overlay")?.classList.add("hidden");
    const deskInput = $("#search-notes");
    const mobInput = $("#mobile-search-input");
    if (deskInput && mobInput) {
      deskInput.value = mobInput.value;
      renderNotes();
    }
  });

  const syncSearch = () => {
    const deskInput = $("#search-notes");
    const mobInput = $("#mobile-search-input");
    if (deskInput && mobInput) {
      if (document.activeElement === deskInput)
        mobInput.value = deskInput.value;
      else if (document.activeElement === mobInput)
        deskInput.value = mobInput.value;
    }
    renderNotes();
  };

  $("#search-notes")?.addEventListener("input", syncSearch);
  $("#mobile-search-input")?.addEventListener("input", syncSearch);

  // Create Note
  const expandCreate = () => {
    $("#create-note-collapsed")?.classList.add("hidden");
    $("#create-note-expanded")?.classList.remove("hidden");
    $("#create-note-expanded")?.classList.add("flex");
    // Garante que a cor inicial é branca ao expandir
    updateCreateContainerColor("white");
    $("#new-note-title")?.focus();
  };

  const collapseCreate = async () => {
    const title = $("#new-note-title")?.value.trim();
    const content = $("#new-note-content")?.value.trim();
    const cat = $("#new-note-cat")?.value;

    if (title || content) {
      // Usa a variável global `currentColor`
      await saveNote({ title, content, color: currentColor, category: cat });
      showToast("Nota criada", "success");

      // Reset inputs
      if ($("#new-note-title")) $("#new-note-title").value = "";
      if ($("#new-note-content")) $("#new-note-content").value = "";
      if ($("#new-note-cat")) $("#new-note-cat").value = "";
      currentColor = "white"; // Reset para o estado inicial
      loadNotes();
    }

    $("#create-note-expanded")?.classList.add("hidden");
    $("#create-note-expanded")?.classList.remove("flex");
    $("#create-note-collapsed")?.classList.remove("hidden");
    updateCreateContainerColor("white"); // Volta a cor do container para branco (estado colapsado)
  };

  $("#create-note-collapsed")?.addEventListener("click", expandCreate);
  $("#create-note-trigger")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(expandCreate, 300);
  });
  $("#close-create-note")?.addEventListener("click", (e) => {
    e.stopPropagation();
    collapseCreate();
  });

  // Edit Modal
  const openEditModal = (note) => {
    currentNoteId = note.id; // Define o ID da nota atual
    if ($("#edit-note-title")) $("#edit-note-title").value = note.title;
    if ($("#edit-note-content")) $("#edit-note-content").value = note.content;
    if ($("#edit-note-cat")) $("#edit-note-cat").value = note.category || "";
    currentColor = note.color || "white";

    updateEditModalColor(currentColor);

    const modal = $("#edit-modal");
    const backdrop = $("#edit-modal-backdrop");
    const content = $("#edit-modal-content");

    if (modal) {
      modal.classList.remove("hidden");
      // Animation
      setTimeout(() => {
        if (backdrop) backdrop.classList.remove("opacity-0");
        if (content) {
          content.classList.remove("opacity-0", "scale-95");
          content.classList.add("opacity-100", "scale-100");
        }
      }, 10);
    }
  };

  /**
   * Fecha o modal de edição.
   * @param {boolean} shouldReload - Indica se deve recarregar as notas (true por padrão).
   */
  const closeEditModal = (shouldReload = true) => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const saveStatus = $("#save-status");
    if (saveStatus) saveStatus.classList.add("opacity-0");

    const modal = $("#edit-modal");
    const backdrop = $("#edit-modal-backdrop");
    const content = $("#edit-modal-content");

    if (backdrop) backdrop.classList.add("opacity-0");
    if (content) {
      content.classList.remove("opacity-100", "scale-100");
      content.classList.add("opacity-0", "scale-95");
    }

    setTimeout(() => {
      if (modal) modal.classList.add("hidden");
      currentNoteId = null;
      if (shouldReload) loadNotes();
    }, 300);
  };

  const triggerAutoSave = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const saveStatus = $("#save-status");
    if (saveStatus) saveStatus.classList.add("opacity-0");

    autoSaveTimer = setTimeout(async () => {
      if (!currentNoteId) return;

      const title = $("#edit-note-title")?.value;
      const content = $("#edit-note-content")?.value;
      const cat = $("#edit-note-cat")?.value;

      // USA a variável global `currentColor` para salvar a cor na edição
      await saveNote({
        id: currentNoteId,
        title,
        content,
        color: currentColor,
        category: cat,
      });

      if (saveStatus) {
        saveStatus.classList.remove("opacity-0");
        saveStatus.classList.add("opacity-100");
        setTimeout(() => saveStatus.classList.add("opacity-0"), 2000);
      }
    }, 800);
  };

  $("#edit-note-title")?.addEventListener("input", triggerAutoSave);
  $("#edit-note-content")?.addEventListener("input", triggerAutoSave);
  $("#edit-note-cat")?.addEventListener("change", triggerAutoSave);
  $("#close-modal-btn")?.addEventListener("click", () => closeEditModal(true));
  $("#edit-modal-backdrop")?.addEventListener("click", () =>
    closeEditModal(true)
  );

  // Lógica de exclusão da lixeira dentro do MODAL
  $("#delete-note-modal-btn")?.addEventListener("click", (e) => {
    e.stopPropagation(); // ESSENCIAL: Impede que o clique feche o modal
    handleDeleteNote(currentNoteId);
  });

  // Lógica de cópia dentro do MODAL
  $("#copy-note-btn")?.addEventListener("click", async (e) => {
    e.stopPropagation(); // Adicionado por segurança
    const t = $("#edit-note-title")?.value || "";
    const c = $("#edit-note-content")?.value || "";
    try {
      // Fallback seguro para cópia
      const textToCopy = `${t}\n\n${c}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback para ambientes restritos (como iframe)
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Falha ao usar execCommand para copiar:", err);
        }
        document.body.removeChild(textarea);
      }
      showToast("Copiado!", "success");
    } catch (err) {
      console.error("Erro ao copiar nota:", err);
      showToast("Falha ao copiar", "error");
    }
  });

  // Cats Modal
  const toggleCats = (show) => {
    const m = $("#cats-modal");
    if (m) {
      if (show) {
        m.classList.remove("hidden");
        m.classList.add("flex");
      } else {
        m.classList.add("hidden");
        m.classList.remove("flex");
      }
    }
  };

  $("#manage-note-cats-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCats(true);
  });
  $("#close-cats-modal")?.addEventListener("click", () => toggleCats(false));
  $("#cats-modal-backdrop")?.addEventListener("click", () => toggleCats(false));

  $("#add-cat-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = e.target.elements.catName;
    if (input && input.value.trim()) {
      await addCategory(input.value.trim(), "note");
      input.value = "";
      renderCategories();
    }
  });

  // Init
  renderColorPicker(
    $("#color-picker-container"),
    updateCreateContainerColor,
    "white"
  );
  loadNotes();
  renderCategories();

  return element;
}
