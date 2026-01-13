export function Help() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 overflow-y-auto";
  element.innerHTML = `
        <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10 mb-6 rounded-xl">
            <div class="flex items-center gap-4">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-white">Central de Ajuda</h1>
            </div>
            <div class="flex items-center gap-4">
                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                    <i class="fas fa-adjust text-xl"></i>
                </button>
            </div>
        </header>

        <div class="max-w-3xl mx-auto w-full space-y-6">
            <!-- Search Bar -->
            <section>
                <div class="relative w-full">
                    <input type="text" id="faq-search" placeholder="O que você precisa saber? Busque aqui..." class="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm">
                    <i class="fas fa-search absolute left-4 top-4 text-gray-400"></i>
                </div>
            </section>

            <!-- FAQ List -->
            <div id="faq-list" class="space-y-4">
                
                <!-- Primeiros Passos -->
                <h3 class="font-bold text-lg text-indigo-600 dark:text-indigo-400 pt-4">Primeiros Passos</h3>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como instalar o aplicativo no meu celular ou computador?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        O Se Organiza é um PWA (Progressive Web App). Na página inicial, procure pelo botão <strong>"Instalar App"</strong>. Se não o vir, no seu navegador (Chrome, Safari, Edge), procure no menu a opção "Instalar aplicativo" ou "Adicionar à tela de início".
                    </p>
                </details>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como funciona o Modo Escuro (Dark Mode)?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Clique no ícone de sol/lua <i class="fas fa-adjust"></i> no canto superior direito de qualquer página para alternar entre os temas claro e escuro. Sua preferência será salva.
                    </p>
                </details>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        O aplicativo funciona offline?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Sim! Após o primeiro acesso, os dados principais são salvos no seu dispositivo, permitindo que você visualize suas informações mesmo sem internet. Novas alterações serão sincronizadas assim que a conexão for restabelecida.
                    </p>
                </details>

                <!-- Finanças -->
                <h3 class="font-bold text-lg text-indigo-600 dark:text-indigo-400 pt-4">Módulo Financeiro</h3>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como adicionar uma nova despesa ou receita?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Vá para a página <strong>"Finanças"</strong> (acessível pelo atalho no Dashboard). Use o formulário no topo para preencher o valor, data, categoria e descrição. Use os botões <span class="font-bold text-red-600">Despesa</span> e <span class="font-bold text-emerald-600">Receita</span> para alternar o tipo.
                    </p>
                </details>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        O que é uma transação "Pendente"?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Ao criar uma transação, você pode desmarcar a caixa "Já foi pago/recebido?". Isso a registrará como <strong>pendente</strong>. Transações pendentes não afetam seu saldo total e servem como lembretes de contas a pagar ou a receber. Você pode editá-las depois para marcar como pagas.
                    </p>
                </details>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como criar categorias personalizadas?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Na página "Finanças", ao lado do seletor de categorias, clique no ícone de engrenagem <i class="fas fa-cog"></i>. Um modal se abrirá, permitindo que você adicione ou exclua suas próprias categorias.
                    </p>
                </details>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como usar o Modo Privacidade no Dashboard?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        No Dashboard, clique no ícone de olho <i class="fas fa-eye"></i> ao lado do "Saldo Total". Isso irá ocultar todos os valores monetários da tela, ideal para quando você está em público. Clique novamente para mostrar.
                    </p>
                </details>

                <!-- Tarefas e Notas -->
                <h3 class="font-bold text-lg text-indigo-600 dark:text-indigo-400 pt-4">Tarefas e Notas</h3>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como usar o quadro Kanban de tarefas?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Na página <strong>"Tarefas"</strong>, você verá três colunas: Pendente, Em Andamento e Concluída. Para mover uma tarefa, simplesmente clique e arraste-a para a coluna desejada. Você também pode usar os botões de ação (<i class="fas fa-play"></i>, <i class="fas fa-check"></i>) dentro de cada card.
                    </p>
                </details>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como funcionam as Notas Rápidas?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Na página <strong>"Notas"</strong>, comece a digitar na área "Criar uma nota...". Ela se expandirá automaticamente. Quando terminar, clique em "Salvar". Para editar, basta clicar em uma nota existente. As alterações são salvas automaticamente enquanto você digita.
                    </p>
                </details>

                <!-- Perfil e Dados -->
                <h3 class="font-bold text-lg text-indigo-600 dark:text-indigo-400 pt-4">Perfil e Segurança</h3>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como fazer backup dos meus dados?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Vá até a página <strong>"Meu Perfil"</strong>. Na seção "Dados", clique em <strong>"Exportar Backup"</strong>. Um arquivo JSON com todos os seus dados (transações, tarefas, notas, etc.) será baixado para o seu dispositivo. Guarde-o em um local seguro.
                    </p>
                </details>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como restaurar um backup?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Na página <strong>"Meu Perfil"</strong>, clique em <strong>"Restaurar Backup"</strong> e selecione o arquivo JSON que você exportou anteriormente. <strong>Atenção:</strong> Esta ação irá mesclar e sobrescrever dados existentes. Use com cuidado.
                    </p>
                </details>
                <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                    <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                        Como excluir minha conta?
                        <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                        Na página <strong>"Meu Perfil"</strong>, role até a "Zona de Perigo" e clique em <strong>"Excluir Minha Conta"</strong>. Você precisará confirmar a ação. Lembre-se que este processo é <strong>permanente e irreversível</strong>. Recomendamos exportar um backup antes.
                    </p>
                </details>

            </div>

            <!-- Contact Section -->
            <section class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white shadow-lg mt-10">
                <h2 class="text-2xl font-bold mb-2">Ainda precisa de ajuda?</h2>
                <p class="mb-6 opacity-90">Nossa equipe de suporte está pronta para te ajudar.</p>
                <a href="mailto:lucianosantosseverino@gmail.com" class="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-md">Entrar em Contato</a>
            </section>
        </div>
    `;

  // FAQ Search Logic
  const searchInput = element.querySelector("#faq-search");
  const faqList = element.querySelector("#faq-list");

  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const details = faqList.querySelectorAll("details");

    details.forEach((detail) => {
      const text = detail.textContent.toLowerCase();
      detail.style.display = text.includes(term) ? "block" : "none";
    });
  });

  return element;
}
