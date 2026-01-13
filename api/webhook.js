import * as admin from "firebase-admin";

// Inicializa o Firebase Admin apenas uma vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Corrige a formatação da chave privada vinda de variáveis de ambiente
      // Aceita tanto quebras de linha reais quanto literais '\n' (comum ao copiar de JSON)
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
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
  console.log("Evento recebido:", event.event || event.type);
  // Log do payload completo para facilitar debug futuro
  console.log("Payload:", JSON.stringify(event, null, 2));

  try {
    // Verifica se o evento é de pagamento pago/concluído
    // Verifique na doc do Abacate Pay o nome exato do evento (ex: 'billing.paid')
    if (event.event === "billing.paid" || event.status === "PAID") {
      const data = event.data || {};

      // CORREÇÃO: Os dados estão dentro de 'billing' no payload recebido
      const billingData = data.billing || data;

      const metadata = billingData.metadata || {};
      let userId = metadata.userId;

      // Fallback: Busca por email se não houver userId (comum em renovações automáticas)
      if (!userId) {
        const customer = billingData.customer || {};
        // O email pode estar direto em customer.email ou em customer.metadata.email
        const customerEmail = customer.email || customer.metadata?.email;

        if (customerEmail) {
          console.log(
            `UserID não encontrado no metadata. Buscando por email: ${customerEmail}`
          );
          const usersQuery = await db
            .collection("users")
            .where("email", "==", customerEmail)
            .limit(1)
            .get();

          if (!usersQuery.empty) {
            userId = usersQuery.docs[0].id;
            console.log(`Usuário encontrado por email: ${userId}`);
          }
        }
      }

      if (userId) {
        // Calcula validade (30 dias a partir do pagamento)
        const paymentDate = new Date();
        const endDate = new Date(paymentDate);
        endDate.setDate(endDate.getDate() + 30);

        // Usamos set com merge para evitar erros caso o documento não exista
        await db
          .collection("users")
          .doc(userId)
          .set(
            {
              isPremium: true,
              premiumEndDate: endDate.toISOString(), // Data de expiração atualizada
              lastPaymentDate: paymentDate.toISOString(),
              paymentId: billingData.id || "unknown",
            },
            { merge: true }
          );

        console.log(
          `Usuário ${userId} atualizado para Premium até ${endDate.toISOString()}.`
        );
      } else {
        console.warn("Usuário não identificado no webhook.");
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
