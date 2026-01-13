import {
  messaging,
  getToken,
  onMessage,
  db,
  collection,
  query,
  where,
  getDocs,
} from "./firebase.js";
import { showToast } from "../utils/ui.js";

// Substitua pela sua VAPID Key gerada no Firebase Console -> Configurações do Projeto -> Cloud Messaging
const VAPID_KEY =
  "BEtAB7oAShWVBSz1vL3LbLxy6qAVwH2r5c1KvtsR5oy48cmWr3x5lMzsu6rQfK3gyuD1W5FHAfiOwozkVpKaihQ";

export async function initNotifications(user) {
  if (!("Notification" in window)) {
    console.log("Este navegador não suporta notificações.");
    return;
  }

  if (Notification.permission === "granted") {
    await setupFCM(user);
    checkDueBills(user);
  } else if (Notification.permission !== "denied") {
    // Podemos solicitar permissão silenciosamente ou esperar ação do usuário
    // Por enquanto, vamos expor uma função para ser chamada via UI
  }
}

export async function requestNotificationPermission(user) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      showToast("Notificações ativadas!", "success");
      await setupFCM(user);
      checkDueBills(user);
    } else {
      showToast("Permissão de notificação negada.", "error");
    }
  } catch (error) {
    console.error("Erro ao solicitar permissão:", error);
  }
}

async function setupFCM(user) {
  try {
    if (VAPID_KEY.includes("REPLACE_ME")) {
      console.warn(
        "⚠️ VAPID Key não configurada. As notificações Push não funcionarão até que você configure a chave em src/services/notifications.service.js"
      );
      return;
    }

    // Registra o Service Worker específico se necessário, ou usa o padrão
    const registration = await navigator.serviceWorker.ready;

    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      console.log("FCM Token:", currentToken);
      // Aqui você enviaria o token para seu backend para salvar no perfil do usuário
      // Como estamos no plano Spark sem backend, apenas logamos para teste (pode ser usado via Postman/Curl)
    } else {
      console.log("Nenhum token de registro disponível.");
    }

    onMessage(messaging, (payload) => {
      console.log("Mensagem recebida em primeiro plano:", payload);
      showToast(
        `${payload.notification.title}: ${payload.notification.body}`,
        "info"
      );
    });
  } catch (err) {
    console.log("Erro ao obter token FCM:", err);
  }
}

// Função para verificar contas a pagar localmente (Simulação de Push via Client-side)
export async function checkDueBills(user) {
  if (!user) return;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Busca despesas pendentes com data de hoje ou anterior
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", user.uid),
    where("type", "==", "expense"),
    where("status", "==", "pending"),
    where("date", "<=", todayStr)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const count = snapshot.size;
    new Notification("Contas a Pagar 💸", {
      body: `Você tem ${count} conta(s) pendente(s) vencendo hoje ou atrasadas.`,
      icon: "/public/icons/icon-192.png",
    });
  }
}
