# 🚀 Se Organiza - PWA de Gestão Pessoal

![Badge em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Se Organiza** é um Progressive Web App (PWA) completo para gestão financeira pessoal, organização de tarefas e notas rápidas. Desenvolvido com foco em performance, usabilidade mobile-first e funcionamento offline.

---

## 📱 Funcionalidades

### 💰 Gestão Financeira

- **Controle de Fluxo**: Registro de receitas e despesas com categorias personalizadas.
- **Dashboard Interativo**: Gráficos visuais (Chart.js) para análise de gastos e ganhos.
- **Metas**: Definição de metas de saldo com barra de progresso.
- **Recorrência**: Suporte a transações mensais e semanais com criação automática.
- **Insights**: Dicas financeiras inteligentes baseadas nos seus dados.
- **Exportação**: Exportação de dados para CSV (Recurso Premium).

### ✅ Produtividade

- **Tarefas (Kanban)**: Quadro interativo com colunas (Pendente, Em Andamento, Concluído) e Drag-and-Drop.
- **Notas Rápidas**: Criação de notas com cores e categorias, estilo Google Keep.
- **Busca Global**: Pesquise em tarefas, notas e transações simultaneamente.

### ⚙️ Sistema

- **PWA**: Instalável em Android, iOS e Desktop. Funciona offline.
- **Autenticação**: Login seguro com Email/Senha e Google via Firebase.
- **Modo Escuro**: Tema claro e escuro alternável.
- **Backup**: Exportação e importação de dados (JSON).
- **Admin**: Painel exclusivo para administradores gerenciarem usuários.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, JavaScript (ES6+), Tailwind CSS (via CDN para dev/MVP).
- **Backend (BaaS)**: Firebase (Authentication, Firestore Database).
- **Bibliotecas**: Chart.js (Gráficos), FontAwesome (Ícones).
- **Hospedagem**: Compatível com GitHub Pages / Firebase Hosting.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Um navegador moderno.
- Um servidor local simples (como Live Server do VSCode, XAMPP, ou Python SimpleHTTPServer) para evitar erros de CORS com módulos ES6.

### Passo a Passo

1. **Clone o repositório**

   ```bash
   git clone https://github.com/SEU_USUARIO/se-organiza.git
   cd se-organiza
   ```

2. **Configuração do Firebase**

   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
   - Ative o **Authentication** (Email/Senha e Google).
   - Crie um banco de dados **Firestore**.
   - Copie as credenciais do seu projeto.
   - Edite o arquivo `src/services/firebase.js` e substitua o objeto `firebaseConfig` pelas suas chaves.

3. **Configuração da API do YouTube (Opcional)**

   - Para a funcionalidade de vídeos, obtenha uma API Key no Google Cloud Console.
   - Edite `src/pages/videos.js` e insira sua chave em `YOUTUBE_API_KEY`.

4. **Executar**
   - Abra a pasta do projeto no seu servidor local.
   - Acesse `http://localhost:SEU_PORTA/` (ou o caminho correspondente).

---

## 🔒 Regras de Segurança (Firestore)

O projeto inclui um arquivo `firestore.rules` configurado para garantir que:

- Usuários só leiam/escrevam seus próprios dados.
- O Administrador tenha acesso global (leitura/escrita controlada).
- Coleções protegidas: `users`, `transactions`, `tasks`, `notes`, `categories`.

---

## 📦 Deploy (GitHub Pages)

Este projeto foi estruturado para rodar perfeitamente no GitHub Pages.

1. Suba o código para o GitHub.
2. Vá em **Settings** > **Pages**.
3. Em **Source**, selecione a branch `main` e a pasta `/root`.
4. Salve e aguarde o link ser gerado.

_Nota: Certifique-se de adicionar seu domínio do GitHub Pages nas configurações de "Authorized Domains" no Firebase Authentication._

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

---

## 📄 Licença

Este projeto está sob a licença MIT.
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

---

## 📄 Licença

Este projeto está sob a licença MIT.
