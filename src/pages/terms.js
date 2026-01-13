export function Terms() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 overflow-y-auto";
  element.innerHTML = `
    <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10 mb-6 rounded-xl">
        <div class="flex items-center gap-4">
            <button onclick="window.history.length > 1 ? window.history.back() : window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                <i class="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">Termos de Uso</h1>
        </div>
        <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
            <i class="fas fa-adjust text-xl"></i>
        </button>
    </header>
    <div class="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4 text-sm leading-relaxed">
        <h2 class="text-2xl font-bold mb-4">Termos e Condições de Uso</h2>
        <p class="text-gray-500 text-xs">Última atualização: ${new Date().toLocaleDateString()}</p>
        
        <h3 class="font-bold text-lg mt-4">1. Aceitação dos Termos</h3>
        <p>Ao acessar e utilizar o aplicativo <strong>Se Organiza</strong>, você concorda integralmente com estes Termos de Uso e com nossa Política de Privacidade. O serviço é regido pelas leis da República Federativa do Brasil.</p>

        <h3 class="font-bold text-lg mt-4">2. Descrição do Serviço</h3>
        <p>O Se Organiza é uma plataforma de gestão financeira e pessoal que oferece ferramentas para controle de receitas, despesas, tarefas e anotações. O serviço é fornecido "como está", podendo sofrer atualizações e modificações sem aviso prévio.</p>

        <h3 class="font-bold text-lg mt-4">3. Responsabilidades do Usuário</h3>
        <ul class="list-disc pl-5 space-y-1">
            <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso (login e senha).</li>
            <li>Você declara que as informações fornecidas no cadastro são verdadeiras e precisas.</li>
            <li>É proibido utilizar o serviço para fins ilícitos ou que violem direitos de terceiros.</li>
        </ul>

        <h3 class="font-bold text-lg mt-4">4. Limitação de Responsabilidade</h3>
        <p>O Se Organiza é uma ferramenta de auxílio e não fornece consultoria financeira, legal ou tributária. Não nos responsabilizamos por decisões tomadas com base nos dados inseridos no aplicativo, nem por eventuais prejuízos decorrentes de falhas técnicas, indisponibilidade do serviço ou força maior.</p>

        <h3 class="font-bold text-lg mt-4">5. Propriedade Intelectual</h3>
        <p>Todo o conteúdo, design, código e marcas presentes no aplicativo são de propriedade exclusiva do desenvolvedor (Santos Codes) ou de seus licenciadores, sendo protegidos pela legislação de direitos autorais e propriedade intelectual.</p>

        <h3 class="font-bold text-lg mt-4">6. Cancelamento e Suspensão</h3>
        <p>Reservamo-nos o direito de suspender ou cancelar contas que violem estes termos, sem necessidade de aviso prévio. O usuário pode encerrar sua conta a qualquer momento através das configurações do perfil.</p>

        <h3 class="font-bold text-lg mt-4">7. Foro</h3>
        <p>Fica eleito o foro da comarca de residência do usuário no Brasil para dirimir quaisquer dúvidas oriundas destes termos.</p>
    </div>
  `;
  return element;
}
