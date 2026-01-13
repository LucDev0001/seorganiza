import {
  auth,
  db,
  doc,
  getDoc,
  updateDoc,
  deleteUser,
  signOut,
  updateProfile,
} from "../services/firebase.js";
import { exportData, importData } from "../services/backup.service.js";
import { showToast, showConfirm } from "../utils/ui.js";
import { getTransactions } from "../services/finance.js";
import { getTasks } from "../services/tasks.service.js";
import { getNotes } from "../services/notes.service.js";

export function Profile() {
  const user = auth.currentUser;
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";

  element.innerHTML = `
        <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-4">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-white">Meu Perfil</h1>
            </div>
            <div class="flex items-center gap-4">
                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                    <i class="fas fa-adjust text-xl"></i>
                </button>
                <button onclick="window.location.hash='/notifications'" class="text-gray-500 hover:text-indigo-600 transition-colors relative">
                    <i class="fas fa-bell text-xl"></i>
                    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </button>
            </div>
        </header>

        <main class="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full overflow-y-auto space-y-6">
            
            <!-- Profile Header Card -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden relative group" id="profile-card">
                <div class="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                    <div class="absolute inset-0 bg-black/10"></div>
                </div>
                <div class="px-6 pb-6 relative">
                    <div class="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-4 sm:mb-0 gap-4">
                        <div class="w-24 h-24 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg relative z-10 group cursor-pointer" id="profile-image-trigger" title="Alterar foto">
                            <div id="profile-img-wrapper" class="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 text-4xl overflow-hidden relative">
                                ${
                                  user.photoURL
                                    ? `<img src="${user.photoURL}" class="w-full h-full object-cover">`
                                    : `<i class="fas fa-user" id="profile-icon"></i>`
                                }
                                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i class="fas fa-camera text-white text-xl"></i>
                                </div>
                            </div>
                            <input type="file" id="profile-upload" accept="image/png, image/jpeg, image/webp" class="hidden">
                        </div>
                        <div class="flex-1 text-center sm:text-left mb-2">
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                                ${user.displayName || "Usuário"}
                                <span id="plan-badge" class="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Free</span>
                            </h2>
                            <p class="text-gray-500 dark:text-gray-400 text-sm">${
                              user.email
                            }</p>
                            <p class="text-gray-400 text-xs mt-1" id="member-since">Membro desde ${new Date(
                              user.metadata.creationTime
                            ).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div class="text-center">
                            <span class="block text-xl font-bold text-gray-800 dark:text-white" id="stat-transactions">...</span>
                            <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">Transações</span>
                        </div>
                        <div class="text-center border-l border-r border-gray-100 dark:border-gray-700">
                            <span class="block text-xl font-bold text-gray-800 dark:text-white" id="stat-tasks">...</span>
                            <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tarefas</span>
                        </div>
                        <div class="text-center">
                            <span class="block text-xl font-bold text-gray-800 dark:text-white" id="stat-notes">...</span>
                            <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">Notas</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Premium CTA -->
            <div id="premium-cta" class="hidden bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transform hover:scale-[1.01] transition-transform cursor-pointer mb-6">
                <div class="absolute right-0 top-0 h-full w-1/2 bg-white/10 skew-x-12 translate-x-10"></div>
                <div class="relative z-10 flex justify-between items-center">
                    <div>
                        <h3 class="font-bold text-xl mb-1"><i class="fas fa-crown text-yellow-200 mr-2"></i>Seja Premium</h3>
                        <p class="text-white/90 text-sm max-w-md">Desbloqueie relatórios avançados, categorias ilimitadas e suporte prioritário.</p>
                        <div id="demo-badge" class="hidden mt-2 inline-block bg-white/20 px-2 py-1 rounded text-xs font-bold">Modo Demo Ativo (24h)</div>
                    </div>
                    <button class="bg-white text-orange-600 px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Assinar Agora
                    </button>
                </div>
                <div id="demo-cta-container" class="mt-4 pt-4 border-t border-white/20 hidden">
                    <p class="text-sm mb-2">Ainda não tem certeza?</p>
                    <button id="btn-activate-demo" class="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-bold transition-colors border border-white/40">
                        <i class="fas fa-clock mr-2"></i> Testar Premium por 24h Grátis
                    </button>
                </div>
            </div>

            <!-- Personal Info Form -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    <i class="fas fa-id-card text-indigo-500"></i> Informações Pessoais
                </h3>
                <form id="profile-form" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="sm:col-span-2">
                            <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">CPF</label>
                            <input type="text" name="cpf" id="cpf" maxlength="14" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="000.000.000-00">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">WhatsApp / Celular</label>
                            <input type="tel" name="phone" id="phone" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Gênero</label>
                            <select name="gender" id="gender" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                                <option value="">Selecione...</option>
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                    </div>
                    <div id="msg" class="hidden p-3 rounded-lg text-center text-sm font-medium"></div>
                    <div class="flex justify-end">
                        <button type="submit" class="px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>

            <!-- Settings & Data Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Settings -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <i class="fas fa-cog text-gray-400"></i> Configurações
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center">
                                    <i class="fas fa-moon"></i>
                                </div>
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Modo Escuro</span>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="theme-toggle-profile" class="sr-only peer">
                                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Data Management -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <i class="fas fa-database text-blue-500"></i> Dados
                    </h3>
                    <div class="space-y-3">
                        <button id="btn-export" class="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                            <span class="text-sm font-medium flex items-center gap-2"><i class="fas fa-download"></i> Exportar Backup</span>
                            <i class="fas fa-chevron-right text-xs opacity-50"></i>
                        </button>
                        <button id="btn-import-trigger" class="w-full flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                            <span class="text-sm font-medium flex items-center gap-2"><i class="fas fa-upload"></i> Restaurar Backup</span>
                            <i class="fas fa-chevron-right text-xs opacity-50"></i>
                        </button>
                        <input type="file" id="file-import" accept=".json" class="hidden">
                    </div>
                </div>
            </div>

            <!-- Share & Danger -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                 <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-sm p-6 text-white">
                    <h3 class="text-lg font-bold mb-2 flex items-center gap-2"><i class="fas fa-heart"></i> Gostou do App?</h3>
                    <p class="text-sm opacity-90 mb-4">Compartilhe com seus amigos e ajude nossa comunidade a crescer.</p>
                    <button id="btn-share-profile" class="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-bold transition-colors">
                        Compartilhar Link
                    </button>
                </div>

                <div class="bg-red-50 dark:bg-red-900/10 rounded-2xl shadow-sm p-6 border border-red-100 dark:border-red-900/30">
                    <h3 class="text-lg font-bold mb-2 text-red-700 dark:text-red-400 flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> Zona de Perigo</h3>
                    <p class="text-sm text-red-600 dark:text-red-300/80 mb-4">A exclusão da conta é permanente e não pode ser desfeita.</p>
                    <button id="btn-delete-account" class="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors">
                        Excluir Minha Conta
                    </button>
                </div>
            </div>
        </main>
    `;

  const form = element.querySelector("#profile-form");
  const msg = element.querySelector("#msg");
  const planBadge = element.querySelector("#plan-badge");
  const premiumCta = element.querySelector("#premium-cta");
  const profileIcon = element.querySelector("#profile-icon");

  // Load Data
  const loadProfile = async () => {
    // Skeleton Loading
    const profileCard = element.querySelector("#profile-card");
    const originalContent = profileCard.innerHTML;
    profileCard.innerHTML = `
        <div class="animate-pulse flex flex-col items-center space-y-4 p-6">
            <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded mt-6"></div>
        </div>
    `;

    try {
      const [docSnap, transactions, tasks, notes] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getTransactions(),
        getTasks(),
        getNotes(),
      ]);

      const data = docSnap.exists() ? docSnap.data() : { isPremium: false };

      if (docSnap.exists()) {
        form.phone.value = data.phone || "";
        form.gender.value = data.gender || "";
        // Formata o CPF ao carregar
        if (data.cpf) {
          form.cpf.value = data.cpf.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
          );
        }

        // Restore content structure (re-bind elements if needed, but here we just update values on the form which is outside the skeleton replacement if we were careful, but since we replaced innerHTML of profile-card, we need to restore it first or update logic.
        // Better approach: Update the DOM elements directly after fetching, removing skeleton class if used, or swap content.
        // Restore content structure
        profileCard.innerHTML = originalContent;

        // Atualizar imagem vinda do Firestore (pois o Auth não suporta Base64 longo)
        if (data.photoURL) {
          const imgWrapper = element.querySelector("#profile-img-wrapper");
          if (imgWrapper) {
            imgWrapper.innerHTML = `
              <img src="${data.photoURL}" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i class="fas fa-camera text-white text-xl"></i>
              </div>`;
          }
        }

        // Re-select elements after innerHTML restore
        const planBadge = element.querySelector("#plan-badge");
        const profileIcon = element.querySelector("#profile-icon");

        // Populate Stats
        element.querySelector("#stat-transactions").textContent =
          transactions.length;
        element.querySelector("#stat-tasks").textContent = tasks.length;
        element.querySelector("#stat-notes").textContent = notes.length;

        // Verifica Demo Mode
        let isDemo = false;
        if (data.demoActivatedAt) {
          const diff =
            (new Date() - new Date(data.demoActivatedAt)) / (1000 * 60 * 60);
          if (diff < 24) isDemo = true;
        }

        // Lógica Visual do Plano
        if (data.isPremium || isDemo) {
          const endDate = data.premiumEndDate
            ? new Date(data.premiumEndDate).toLocaleDateString("pt-BR")
            : "Assinatura Ativa";

          planBadge.textContent = isDemo ? "DEMO 24H" : "PREMIUM";
          planBadge.className = isDemo
            ? "text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold"
            : "text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 font-bold";

          if (profileIcon)
            profileIcon.className = isDemo
              ? "fas fa-stopwatch text-indigo-500"
              : "fas fa-crown text-yellow-500";

          // Adiciona info de validade abaixo do email
          const memberSince = element.querySelector("#member-since");
          if (memberSince) {
            const validText = isDemo
              ? "Expira em breve"
              : `Válido até: ${endDate}`;
            memberSince.innerHTML += `<br><span class="${
              isDemo ? "text-indigo-600" : "text-yellow-600"
            } dark:text-yellow-400 font-bold"><i class="fas fa-calendar-check"></i> ${validText}</span>`;
          }

          premiumCta.classList.add("hidden");
        } else {
          setupFreeUserView(data.demoActivatedAt);
        }
      } else {
        // Fallback se o documento do usuário não existir
        profileCard.innerHTML = originalContent;
        setupFreeUserView(null);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      profileCard.innerHTML = originalContent; // Restore on error
    }
  };

  const setupFreeUserView = (hasUsedDemo) => {
    premiumCta.classList.remove("hidden");

    // Configura botão de Demo se nunca usou
    const demoContainer = element.querySelector("#demo-cta-container");
    const btnDemo = element.querySelector("#btn-activate-demo");

    if (!hasUsedDemo) {
      demoContainer.classList.remove("hidden");
      btnDemo.onclick = (e) => {
        e.stopPropagation(); // Evita clique no card pai
        showConfirm(
          "Ativar o Modo Demonstração? Você terá acesso a todos os recursos Premium por 24 horas.",
          async () => {
            try {
              await updateDoc(doc(db, "users", user.uid), {
                demoActivatedAt: new Date().toISOString(),
              });

              if (window.confetti) {
                window.confetti({
                  particleCount: 150,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ["#4F46E5", "#F59E0B", "#10B981"],
                });
              }

              showToast("Modo Demo ativado! Aproveite.");
              setTimeout(() => window.location.reload(), 2000);
            } catch (err) {
              console.error(err);
              showToast("Erro ao ativar demo.", "error");
            }
          }
        );
      };
    }

    premiumCta.onclick = () => {
      window.location.hash = "/plans";
    };
  };

  loadProfile();

  // Máscara de CPF no Perfil
  const cpfInput = element.querySelector("#cpf");
  cpfInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    e.target.value = value;
  });

  // Máscara de Telefone no Perfil
  const phoneInput = element.querySelector("#phone");
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    e.target.value = value;
  });

  // Lógica de Upload de Foto (Delegação de Eventos)
  element.addEventListener("click", (e) => {
    if (e.target.closest("#profile-image-trigger")) {
      const input = element.querySelector("#profile-upload");
      if (input) input.click();
    }
  });

  element.addEventListener("change", async (e) => {
    if (e.target.id === "profile-upload") {
      const file = e.target.files[0];
      if (!file) return;

      // Validação de tamanho (2MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("A imagem original deve ter no máximo 5MB.", "error");
        return;
      }

      try {
        showToast("Processando imagem...", "info");

        // Converte e comprime a imagem para Base64 (Data URL)
        const photoURL = await compressImage(file);

        // Verifica se o resultado final cabe no Firestore (limite de segurança ~900KB)
        if (photoURL.length > 900000) {
          showToast(
            "A imagem é muito complexa. Tente outra mais simples.",
            "error"
          );
          return;
        }

        // Atualiza apenas o Firestore (Auth tem limite de caracteres para photoURL)
        // await updateProfile(user, { photoURL }); // Removido para evitar erro "Photo URL too long"
        await updateDoc(doc(db, "users", user.uid), { photoURL });

        // Atualiza UI imediatamente
        const imgWrapper = element.querySelector("#profile-img-wrapper");
        if (imgWrapper) {
          imgWrapper.innerHTML = `
            <img src="${photoURL}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="fas fa-camera text-white text-xl"></i>
            </div>
          `;
        }

        showToast("Foto de perfil atualizada!");
      } catch (error) {
        console.error("Erro no upload:", error);
        showToast("Erro ao atualizar foto.", "error");
      }
    }
  });

  // Save Data
  // Re-attach listener because of innerHTML replacement in loadProfile
  element.addEventListener("submit", async (e) => {
    if (e.target.id !== "profile-form") return;
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector("button");
    const msg = element.querySelector("#msg");

    btn.disabled = true;
    btn.textContent = "Salvando...";
    msg.classList.add("hidden");

    try {
      await updateDoc(doc(db, "users", user.uid), {
        phone: form.phone.value.replace(/\D/g, ""),
        cpf: form.cpf.value.replace(/\D/g, ""),
        gender: form.gender.value,
      });
      msg.textContent = "Perfil atualizado com sucesso!";
      msg.className =
        "p-3 rounded text-center text-sm bg-green-100 text-green-700 block";
    } catch (error) {
      msg.textContent = "Erro ao atualizar perfil.";
      msg.className =
        "p-3 rounded text-center text-sm bg-red-100 text-red-700 block";
    } finally {
      btn.disabled = false;
      btn.textContent = "Salvar Alterações";
    }
  });

  // Share Logic
  const btnShareProfile = element.querySelector("#btn-share-profile");
  btnShareProfile.onclick = async () => {
    const shareData = {
      title: "Se Organiza",
      text: "Gerencie suas finanças e tarefas com o Se Organiza! Acesse:",
      url: window.location.href.split("#")[0],
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareData.text + " " + shareData.url);
      showToast("Link copiado para a área de transferência!");
    }
  };

  // Backup Logic
  const btnExport = element.querySelector("#btn-export");
  const btnImportTrigger = element.querySelector("#btn-import-trigger");
  const fileImport = element.querySelector("#file-import");

  btnExport.onclick = async () => {
    try {
      btnExport.disabled = true;
      btnExport.innerHTML =
        '<i class="fas fa-circle-notch fa-spin"></i> Exportando...';
      await exportData();
      showToast("Backup exportado com sucesso!");
    } catch (error) {
      console.error(error);
      showToast("Erro ao exportar dados.", "error");
    } finally {
      btnExport.disabled = false;
      btnExport.innerHTML = '<i class="fas fa-download"></i> Exportar Backup';
    }
  };

  btnImportTrigger.onclick = () => fileImport.click();

  fileImport.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showConfirm(
      "Isso irá sobrescrever/mesclar os dados atuais com o backup. Deseja continuar?",
      async () => {
        try {
          btnImportTrigger.disabled = true;
          btnImportTrigger.innerHTML =
            '<i class="fas fa-circle-notch fa-spin"></i> Restaurando...';
          await importData(file);
          showToast("Dados restaurados com sucesso!");
          setTimeout(() => window.location.reload(), 1500); // Reload to reflect changes
        } catch (error) {
          console.error(error);
          showToast("Erro ao restaurar backup.", "error");
        } finally {
          btnImportTrigger.disabled = false;
          btnImportTrigger.innerHTML =
            '<i class="fas fa-upload"></i> Restaurar Backup';
          fileImport.value = ""; // Reset input
        }
      }
    );
  };

  // Delete Account Logic
  const btnDelete = element.querySelector("#btn-delete-account");
  btnDelete.onclick = () => {
    showConfirm(
      "Tem certeza absoluta? Essa ação não pode ser desfeita.",
      async () => {
        try {
          await deleteUser(user);
          showToast("Conta excluída com sucesso.");
          window.location.reload();
        } catch (error) {
          console.error(error);
          if (error.code === "auth/requires-recent-login") {
            showToast(
              "Por segurança, faça login novamente para excluir a conta.",
              "error"
            );
            await signOut(auth);
          } else {
            showToast("Erro ao excluir conta.", "error");
          }
        }
      }
    );
  };

  // Theme Toggle Logic
  const themeToggle = element.querySelector("#theme-toggle-profile");
  if (themeToggle) {
    themeToggle.checked = document.documentElement.classList.contains("dark");
    themeToggle.addEventListener("change", () => {
      window.toggleTheme();
    });
  }

  return element;
}

// Função auxiliar para comprimir imagem e converter para Base64
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Redimensiona para no máximo 200x200 (Compressão agressiva para Firestore)
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Comprime para JPEG com qualidade 0.5
        resolve(canvas.toDataURL("image/jpeg", 0.5));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
