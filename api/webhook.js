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
      const data = event.data || {};
      const metadata = data.metadata || {};
      let userId = metadata.userId;

      // Fallback: Busca por email se não houver userId (comum em renovações automáticas)
      if (!userId && data.customer && data.customer.email) {
        const usersQuery = await db
          .collection("users")
          .where("email", "==", data.customer.email)
          .limit(1)
          .get();

        if (!usersQuery.empty) {
          userId = usersQuery.docs[0].id;
        }
      }

      if (userId) {
        // Calcula validade (30 dias a partir do pagamento)
        const paymentDate = new Date();
        const endDate = new Date(paymentDate);
        endDate.setDate(endDate.getDate() + 30);

        await db.collection("users").doc(userId).update({
          isPremium: true,
          premiumEndDate: endDate.toISOString(), // Data de expiração atualizada
          lastPaymentDate: paymentDate.toISOString(),
          paymentId: data.id,
        });
        console.log(
          `Usuário ${userId} atualizado para Premium até ${endDate.toISOString()}.`
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
