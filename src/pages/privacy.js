export function Privacy() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 overflow-y-auto";
  element.innerHTML = `
    <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10 mb-6 rounded-xl">
        <div class="flex items-center gap-4">
            <button onclick="window.history.length > 1 ? window.history.back() : window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                <i class="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">Política de Privacidade</h1>
        </div>
        <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
            <i class="fas fa-adjust text-xl"></i>
        </button>
    </header>
    <div class="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4 text-sm leading-relaxed">
        <h2 class="text-2xl font-bold mb-4">Política de Privacidade</h2>
        <p class="text-gray-500 text-xs">Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>

        <h3 class="font-bold text-lg mt-4">1. Coleta de Dados</h3>
        <p>Coletamos os seguintes dados pessoais estritamente necessários para o funcionamento do serviço:</p>
        <ul class="list-disc pl-5 space-y-1">
            <li><strong>Dados de Cadastro:</strong> Nome, e-mail e foto de perfil (opcional).</li>
            <li><strong>Dados Financeiros e Pessoais:</strong> Transações, tarefas, notas e metas inseridas voluntariamente por você.</li>
            <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de dispositivo e logs de acesso para segurança e auditoria.</li>
        </ul>

        <h3 class="font-bold text-lg mt-4">2. Finalidade do Tratamento</h3>
        <p>Seus dados são utilizados para:</p>
        <ul class="list-disc pl-5 space-y-1">
            <li>Autenticação e segurança da sua conta.</li>
            <li>Fornecimento das funcionalidades de gestão financeira e organização pessoal.</li>
            <li>Comunicação sobre atualizações, suporte técnico e notificações do sistema.</li>
        </ul>

        <h3 class="font-bold text-lg mt-4">3. Armazenamento e Segurança</h3>
        <p>Os dados são armazenados em servidores seguros do Google Firebase. Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados, perda ou alteração.</p>

        <h3 class="font-bold text-lg mt-4">4. Compartilhamento de Dados</h3>
        <p>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais. O compartilhamento ocorre apenas quando necessário para a operação do serviço (ex: infraestrutura de nuvem) ou por obrigação legal.</p>

        <h3 class="font-bold text-lg mt-4">5. Seus Direitos (LGPD)</h3>
        <p>Você tem direito a:</p>
        <ul class="list-disc pl-5 space-y-1">
            <li>Acessar seus dados.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar a exclusão de seus dados (disponível na área "Meu Perfil").</li>
            <li>Revogar o consentimento a qualquer momento.</li>
        </ul>

        <h3 class="font-bold text-lg mt-4">6. Cookies e Tecnologias Semelhantes</h3>
        <p>Utilizamos cookies e armazenamento local para manter sua sessão ativa e salvar preferências de usuário (como o tema escuro/claro).</p>

        <h3 class="font-bold text-lg mt-4">7. Contato</h3>
        <p>Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato com o encarregado de dados através do e-mail: <a href="mailto:lucianosantosseverino@gmail.com" class="text-indigo-600 hover:underline">lucianosantosseverino@gmail.com</a>.</p>
    </div>
  `;
  return element;
}
