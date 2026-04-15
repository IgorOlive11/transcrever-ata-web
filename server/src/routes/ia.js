const express = require("express");
const { OpenAI } = require("openai");

const router = express.Router();

/**
 * POST /api/ia/detectar
 * Detecta informações da assembleia a partir da transcrição
 */
router.post("/detectar", async (req, res) => {
  const { campo, transcricao } = req.body;

  if (!transcricao || !campo) {
    return res.status(400).json({ error: "campo e transcricao são obrigatórios" });
  }

  const prompts = {
    nome_condominio: `Da seguinte transcrição de assembleia, extraia apenas o nome do condomínio (somente o nome, sem explicações): ${transcricao.slice(0, 1000)}`,
    pautas: `Da seguinte transcrição, liste as principais pautas/assuntos discutidos, separados por vírgula (apenas a lista, sem explicações): ${transcricao.slice(0, 2000)}`,
  };

  if (!prompts[campo]) {
    return res.status(400).json({ error: `Campo '${campo}' não suportado` });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extraia apenas a informação solicitada da transcrição, sem explicações adicionais.",
        },
        { role: "user", content: prompts[campo] },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    res.json({ resultado: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error("Erro IA:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
