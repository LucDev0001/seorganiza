import {
  auth,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  updateDoc,
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

async function router() {
  const app = document.getElementById("app");
  let hash = window.location.hash.slice(1) || "/";

  // Proteção de Rotas
  if (
    !state.user &&
    hash !== "/login" &&
    hash !== "/" &&
    hash !== "/terms" &&
    hash !== "/privacy" &&
    hash !== "/register" &&
    hash !== "/forgot-password"
  ) {
    window.location.hash = "/"; // Redireciona para Landing se tentar acessar rota protegida sem logar
    return;
  }

  // Redirecionamento se logado
  if (state.user && (hash === "/login" || hash === "/")) {
    window.location.hash = "/dashboard";
    return;
  }

  // Proteção Admin
  if (hash === "/admin" && !state.isAdmin) {
    console.warn("Acesso negado: Apenas administradores.");
    window.location.hash = "/dashboard";
    return;
  }

  // Renderização
  app.innerHTML = ""; // Limpa o conteúdo anterior

  if (hash === "/") {
    app.appendChild(Landing());
  } else if (hash === "/login") {
    app.appendChild(Login());
  } else if (hash === "/register") {
    app.appendChild(Register());
  } else if (hash === "/forgot-password") {
    app.appendChild(ForgotPassword());
  } else if (hash === "/dashboard") {
    app.appendChild(Dashboard());
  } else if (hash === "/tasks") {
    app.appendChild(Tasks());
  } else if (hash === "/finance") {
    app.appendChild(Finance());
  } else if (hash === "/admin") {
    app.appendChild(Admin());
  } else if (hash === "/notes") {
    app.appendChild(Notes());
  } else if (hash === "/about") {
    app.appendChild(About());
  } else if (hash === "/plans") {
    app.appendChild(Plans());
  } else if (hash === "/terms") {
    app.appendChild(Terms());
  } else if (hash === "/privacy") {
    app.appendChild(Privacy());
  } else if (hash === "/profile") {
    app.appendChild(Profile());
  } else if (hash === "/notifications") {
    app.appendChild(Notifications());
  } else if (hash === "/help") {
    app.appendChild(Help());
  } else if (hash === "/videos") {
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

    // Verificação de Assinatura Premium
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();

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
