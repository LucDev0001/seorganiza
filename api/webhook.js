import * as admin from "firebase-admin";

// Inicializa o Firebase Admin apenas uma vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Corrige a formatação da chave privada vinda de variáveis de ambiente
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, "\n")
        : undefined,
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const event = req.body;

  try {
    // Verifica se o evento é de pagamento pago/concluído
    // Verifique na doc do Abacate Pay o nome exato do evento (ex: 'billing.paid')
    if (event.event === "billing.paid" || event.status === "PAID") {
      const metadata = event.data.metadata || {};
      const userId = metadata.userId;

      if (userId) {
        // Atualiza o usuário no Firestore para Premium
        await db.collection("users").doc(userId).update({
          isPremium: true,
          premiumSince: new Date().toISOString(),
          paymentId: event.data.id,
        });
        console.log(`Usuário ${userId} atualizado para Premium.`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
