import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, email, name } = req.body;
  const ABACATE_API_KEY = process.env.ABACATE_PAY_API_KEY;

  if (!userId || !email) {
    return res.status(400).json({ error: "Missing user data" });
  }

  try {
    // Criação da cobrança no Abacate Pay
    // Consulte a documentação oficial do Abacate Pay para os campos exatos (billing/create)
    const response = await axios.post(
      "https://api.abacatepay.com/v1/billing/create",
      {
        frequency: "ONE_TIME", // ou 'MONTHLY' para assinatura
        methods: ["PIX", "CREDIT_CARD"],
        products: [
          {
            externalId: "premium_plan",
            name: "Se Organiza Premium",
            quantity: 1,
            price: 2990, // R$ 29,90 (Exemplo em centavos)
            description: "Acesso vitalício às funcionalidades Premium",
          },
        ],
        returnUrl: "https://seu-projeto.vercel.app/#/dashboard?success=true",
        completionUrl:
          "https://seu-projeto.vercel.app/#/dashboard?success=true",
        customer: {
          name: name || "Usuario Se Organiza",
          email: email,
          taxId: "00000000000", // Opcional ou coletar do usuário se for obrigatório
        },
        // IMPORTANTE: Passamos o userId como metadata para recuperar no webhook
        metadata: {
          userId: userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ABACATE_API_KEY}`,
        },
      }
    );

    // Retorna a URL de pagamento para o frontend redirecionar
    return res.status(200).json({ url: response.data.data.url });
  } catch (error) {
    console.error("Erro Abacate Pay:", error.response?.data || error.message);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
