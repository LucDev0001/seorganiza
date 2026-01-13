import {
  auth,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "./services/firebase.js";
import { Login } from "./pages/login.js";
import { Register } from "./pages/register.js";
import { ForgotPassword } from "./pages/forgot-password.js";
import { Dashboard } from "./pages/dashboard.js";
import { Tasks } from "./pages/tasks.js";
import { Finance } from "./pages/finance.js";
import { Admin } from "./pages/admin.js";
import { Notes } from "./pages/notes.js";
import { About } from "./pages/about.js";
import { Plans } from "./pages/plans.js";
import { Terms } from "./pages/terms.js";
import { Privacy } from "./pages/privacy.js";
import { Profile } from "./pages/profile.js";
import { Notifications, updateGlobalBadge } from "./pages/notifications.js";
import { Landing } from "./pages/landing.js";
import { Help } from "./pages/help.js";
import { Videos } from "./pages/videos.js";
import { NotFound } from "./pages/not-found.js";
import { showToast } from "./utils/ui.js";
import { initNotifications } from "./services/notifications.service.js";

// Estado Global Simples
const state = {
  user: null,
  isAdmin: false,
};

// Configuração do Admin (Frontend Check - Segurança real está no Firestore Rules)
const ADMIN_EMAIL = "lucianosantosseverino@gmail.com";

// Router Básico
const routes = {
  "/": "home", // Página inicial
  "/login": "login",
  "/register": "register",
  "/forgot-password": "forgot-password",
  "/dashboard": "dashboard",
  "/finance": "finance",
  "/tasks": "tasks",
  "/admin": "admin",
  "/notes": "notes",
  "/about": "about",
  "/plans": "plans",
  "/terms": "terms",
  "/privacy": "privacy",
  "/profile": "profile",
  "/notifications": "notifications",
  "/help": "help",
  "/videos": "videos",
};

// Configuração de SEO por Rota
const seoConfig = {
  "/": {
    title: "Início",
    desc: "Organize suas finanças, tarefas e notas em um único lugar. Simples e gratuito.",
  },
  "/login": {
    title: "Entrar",
    desc: "Acesse sua conta no Se Organiza para gerenciar suas finanças.",
  },
  "/register": {
    title: "Criar Conta",
    desc: "Cadastre-se no Se Organiza e comece a controlar sua vida financeira.",
  },
  "/forgot-password": {
    title: "Recuperar Senha",
    desc: "Recupere o acesso à sua conta.",
  },
  "/dashboard": {
    title: "Dashboard",
    desc: "Visão geral das suas finanças, saldo e atividades recentes.",
  },
  "/finance": {
    title: "Finanças",
    desc: "Gerencie receitas, despesas e categorias financeiras.",
  },
  "/tasks": {
    title: "Tarefas",
    desc: "Quadro Kanban para organizar suas tarefas e pendências.",
  },
  "/notes": { title: "Notas", desc: "Suas anotações rápidas e ideias." },
  "/admin": {
    title: "Administração",
    desc: "Painel de controle administrativo.",
  },
  "/about": { title: "Sobre", desc: "Saiba mais sobre o projeto Se Organiza." },
  "/plans": {
    title: "Planos Premium",
    desc: "Conheça nossos planos e desbloqueie recursos exclusivos.",
  },
  "/terms": {
    title: "Termos de Uso",
    desc: "Termos e condições de uso do aplicativo.",
  },
  "/privacy": {
    title: "Privacidade",
    desc: "Política de privacidade e proteção de dados.",
  },
  "/profile": {
    title: "Meu Perfil",
    desc: "Gerencie seus dados pessoais e configurações.",
  },
  "/notifications": {
    title: "Notificações",
    desc: "Suas notificações e alertas do sistema.",
  },
  "/help": { title: "Ajuda", desc: "Central de ajuda e suporte." },
  "/videos": {
    title: "Vídeos e Dicas",
    desc: "Conteúdos educativos sobre finanças e organização.",
  },
};

function updateSEO(path) {
  const config = seoConfig[path] || {
    title: "App",
    desc: "Se Organiza - Gestão Pessoal",
  };

  // Atualiza Título
  document.title = `${config.title} | Se Organiza`;

  // Atualiza Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = config.desc;
}

async function router() {
  const app = document.getElementById("app");
  let hash = window.location.hash.slice(1) || "/";
  const path = hash.split("?")[0]; // Ignora query params (ex: ?success=true)

  // Proteção de Rotas
  if (
    !state.user &&
    path !== "/login" &&
    path !== "/" &&
    path !== "/terms" &&
    path !== "/privacy" &&
    path !== "/register" &&
    path !== "/forgot-password"
  ) {
    window.location.hash = "/"; // Redireciona para Landing se tentar acessar rota protegida sem logar
    return;
  }

  // Redirecionamento se logado
  if (state.user && (path === "/login" || path === "/")) {
    window.location.hash = "/dashboard";
    return;
  }

  // Proteção Admin
  if (path === "/admin" && !state.isAdmin) {
    console.warn("Acesso negado: Apenas administradores.");
    window.location.hash = "/dashboard";
    return;
  }

  // Atualiza SEO baseado na rota atual
  updateSEO(path);

  // Renderização
  app.innerHTML = ""; // Limpa o conteúdo anterior

  if (path === "/") {
    app.appendChild(Landing());
  } else if (path === "/login") {
    app.appendChild(Login());
  } else if (path === "/register") {
    app.appendChild(Register());
  } else if (path === "/forgot-password") {
    app.appendChild(ForgotPassword());
  } else if (path === "/dashboard") {
    app.appendChild(Dashboard());
  } else if (path === "/tasks") {
    app.appendChild(Tasks());
  } else if (path === "/finance") {
    app.appendChild(Finance());
  } else if (path === "/admin") {
    app.appendChild(Admin());
  } else if (path === "/notes") {
    app.appendChild(Notes());
  } else if (path === "/about") {
    app.appendChild(About());
  } else if (path === "/plans") {
    app.appendChild(Plans());
  } else if (path === "/terms") {
    app.appendChild(Terms());
  } else if (path === "/privacy") {
    app.appendChild(Privacy());
  } else if (path === "/profile") {
    app.appendChild(Profile());
  } else if (path === "/notifications") {
    app.appendChild(Notifications());
  } else if (path === "/help") {
    app.appendChild(Help());
  } else if (path === "/videos") {
    app.appendChild(Videos());
  } else {
    app.appendChild(NotFound());
  }
}

// Inicialização
window.addEventListener("hashchange", router);

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  state.isAdmin = user && user.email === ADMIN_EMAIL;

  if (user) {
    initNotifications(user);

    // Verificação de Perfil e Assinatura
    try {
      const userDocRef = doc(db, "users", user.uid);
      let userDoc = await getDoc(userDocRef);

      // AUTO-CORREÇÃO: Se o usuário existe no Auth mas não no Firestore, cria agora.
      if (!userDoc.exists()) {
        console.log("Perfil não encontrado no Firestore. Criando...");
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString(),
          isPremium: false,
          isAdmin: user.email === ADMIN_EMAIL, // Garante seu Admin se for seu email
        });
        userDoc = await getDoc(userDocRef); // Recarrega para usar abaixo
        showToast("Perfil sincronizado com sucesso.", "success");
      }

      if (userDoc.exists()) {
        const data = userDoc.data();

        // AUTO-CORREÇÃO ADMIN: Garante permissão no banco se o email bater
        if (user.email === ADMIN_EMAIL && !data.isAdmin) {
          await updateDoc(userDocRef, { isAdmin: true });
          showToast("Permissões de administrador restauradas.", "success");
        }

        // Lógica de Modo Demonstração (24h)
        let isDemoActive = false;
        if (data.demoActivatedAt) {
          const demoStart = new Date(data.demoActivatedAt);
          const now = new Date();
          const diffHours = (now - demoStart) / (1000 * 60 * 60);
          if (diffHours < 24) {
            isDemoActive = true;
            // Injeta flag temporária no objeto user para uso na sessão
            user.isDemo = true;
          }
        }

        if (data.isPremium && data.premiumEndDate && !isDemoActive) {
          const today = new Date();
          const endDate = new Date(data.premiumEndDate);
          const diffTime = endDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            // Expirou
            await updateDoc(userDocRef, { isPremium: false });
            showToast("Sua assinatura Premium expirou.", "error");
          } else if (diffDays <= 5) {
            // Vence em breve (mostra apenas uma vez por sessão)
            if (!sessionStorage.getItem("expiryWarned")) {
              showToast(
                `Sua assinatura vence em ${diffDays} dias. Renove para continuar aproveitando!`,
                "info"
              );
              sessionStorage.setItem("expiryWarned", "true");
            }
          }
        }
      }
    } catch (e) {
      console.error("Erro ao verificar assinatura", e);
    }
  }

  router();
});

// Real-time Notification Badge
setInterval(updateGlobalBadge, 60000); // Check every minute
window.addEventListener("hashchange", () => setTimeout(updateGlobalBadge, 500)); // Check on nav

// Dark Mode Logic
window.toggleTheme = () => {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
};

// Init Theme
if (
  localStorage.getItem("theme") === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

// Service Worker Registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .catch((err) => console.error("SW Error:", err));
}

// Global PWA Install Event Capture
window.deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  window.dispatchEvent(new Event("pwa-install-available"));
});

// Online/Offline Status Handlers
window.addEventListener("online", () =>
  showToast("Conexão restabelecida!", "success")
);
window.addEventListener("offline", () =>
  showToast("Você está offline. O app continuará funcionando.", "error")
);
