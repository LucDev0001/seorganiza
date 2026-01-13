import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, email, name, taxId, cellphone } = req.body;
  const ABACATE_API_KEY = process.env.ABACATE_PAY_API_KEY;

  // Define a URL base. Na Vercel, configure a variável de ambiente BASE_URL
  // Exemplo de valor para BASE_URL: https://se-organiza.vercel.app
  const BASE_URL = process.env.BASE_URL || "https://seorganiza.vercel.app";

  if (!userId || !email) {
    return res.status(400).json({ error: "Missing user data" });
  }

  try {
    // Criação da cobrança no Abacate Pay
    // Consulte a documentação oficial do Abacate Pay para os campos exatos (billing/create)
    const response = await axios.post(
      "https://api.abacatepay.com/v1/billing/create",
      {
        frequency: "MONTHLY",
        methods: ["PIX"],
        products: [
          {
            externalId: "premium_plan",
            name: "Se Organiza Premium",
            quantity: 1,
            price: 999, // R$ 9,99
            description: "Assinatura Mensal Se Organiza Premium",
          },
        ],
        returnUrl: `${BASE_URL}/#/dashboard?success=true`,
        completionUrl: `${BASE_URL}/#/dashboard?success=true`,
        customer: {
          name: name || "Usuario Se Organiza",
          email: email,
          taxId: taxId || "00000000000",
          cellphone: cellphone || "11999999999",
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
    // Captura a mensagem detalhada de erro do Abacate Pay ou do Axios
    const errorDetails = error.response?.data || error.message;
    console.error("Erro Abacate Pay:", JSON.stringify(errorDetails));

    // Retorna o erro detalhado para o frontend para facilitar o debug
    return res.status(500).json({
      error: "Erro ao processar pagamento",
      details: errorDetails,
    });
  }
}
