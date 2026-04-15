const express = require("express");
const path = require("path");
const fs = require("fs");
const { OpenAI } = require("openai");

const router = express.Router();

const DEFAULT_GPT_MODEL = process.env.GPT_MODEL || "gpt-4o";

// ─── Helpers ────────────────────────────────────────────────────────────────

function dividirTranscricao(transcricao, maxChars = 8000) {
  if (transcricao.length <= maxChars) return [transcricao];
  const blocos = [];
  let atual = "";
  for (const linha of transcricao.split("\n")) {
    if (atual.length + linha.length > maxChars && atual) {
      blocos.push(atual);
      atual = "";
    }
    atual += linha + "\n";
  }
  if (atual.trim()) blocos.push(atual);
  return blocos;
}

function dataExtenso(dataStr) {
  try {
    const [d, m, y] = dataStr.split("/").map(Number);
    const dias = ["","primeiro","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove","vinte","vinte e um","vinte e dois","vinte e três","vinte e quatro","vinte e cinco","vinte e seis","vinte e sete","vinte e oito","vinte e nove","trinta","trinta e um"];
    const meses = ["","janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
    const anosMap = { 2024: "dois mil e vinte e quatro", 2025: "dois mil e vinte e cinco", 2026: "dois mil e vinte e seis", 2027: "dois mil e vinte e sete" };
    return `${dias[d] || d} dias do mês de ${meses[m] || m} de ${anosMap[y] || y}`;
  } catch { return "[data por extenso]"; }
}

async function processarBloco(client, bloco, info, numeroBloco, totalBlocos) {
  const {
    nome_condominio = "CONDOMÍNIO [NOME]",
    endereco_condominio = "[ENDEREÇO]",
    data_assembleia = "00/00/0000",
    tipo_assembleia = "EXTRAORDINÁRIA",
    presidente_nome = "[PRESIDENTE]",
    presidente_apartamento = "N/A",
    secretario_nome = "[SECRETÁRIO]",
    secretario_apartamento = "N/A",
    numero_presentes = "20",
    local_realizacao = "[LOCAL]",
    horario_inicio = "19h30",
    horario_encerramento = "21h30",
    pautas = ["Assuntos diversos"],
  } = info;

  const dataPorExtenso = dataExtenso(data_assembleia);
  const pautasFormatadas = pautas.map((p, i) => `**${i + 1}º)** ${p.trim()}`).join("; ");

  let instrucoes = "";

  if (numeroBloco === 1 && totalBlocos === 1) {
    instrucoes = `
**ABERTURA OBRIGATÓRIA:**
"Aos ${dataPorExtenso}, às ${horario_inicio}, em segunda e última convocação, ${local_realizacao}, **${nome_condominio}**, situado à ${endereco_condominio}, realizou-se a Assembleia Geral **${tipo_assembleia}** do citado condomínio, de acordo com edital de convocação enviado previamente a todos os proprietários e moradores, conforme ${numero_presentes} assinaturas apostas no livro de presenças, sendo 01 (uma) unidade representada por procuração, para deliberar sobre a seguinte pauta: ${pautasFormatadas}. Para presidir a assembleia foi convidado **${presidente_nome}**, apto. ${presidente_apartamento} e para secretariá-la, **${secretario_nome}**, apto. ${secretario_apartamento}. Foi dispensada a leitura do edital de convocação, assim como da ata da última assembleia, que teve a aprovação de todos."

QUEBRA DE LINHA

**DESENVOLVIMENTO - SEÇÕES NUMERADAS:**
Desenvolva cada pauta em discurso indireto formal. Use verbos como "foi informado que", "foi relatado que", "foi esclarecido que", "foi deliberado que".
- Use **negrito** para nomes completos e valores financeiros
- Valores sempre no formato **R$ X,XX (valor por extenso)**

QUEBRA DE LINHA

**ENCERRAMENTO OBRIGATÓRIO:**
"Nada mais havendo a tratar, encerrou-se a assembleia às ${horario_encerramento}, lavrando-se a presente ata, que vai assinada pelo presidente da mesa e pela secretária, para que produza seus efeitos legais e jurídicos. Juiz de Fora, ${data_assembleia}."
`;
  } else if (numeroBloco === 1) {
    instrucoes = `ABERTURA + PRIMEIROS ASSUNTOS. Inclua o parágrafo de abertura com todos os dados e desenvolva os primeiros itens da pauta em seções numeradas. NÃO inclua encerramento.`;
  } else if (numeroBloco === totalBlocos) {
    instrucoes = `Continue a numeração de seções dos blocos anteriores. Desenvolva os últimos assuntos. ENCERRAMENTO OBRIGATÓRIO: "Nada mais havendo a tratar, encerrou-se a assembleia às ${horario_encerramento}, lavrando-se a presente ata, que vai assinada pelo presidente da mesa e pela secretária, para que produza seus efeitos legais e jurídicos. Juiz de Fora, ${data_assembleia}."`;
  } else {
    instrucoes = `Continue a numeração de seções dos blocos anteriores. Desenvolva os assuntos deste trecho. NÃO inclua abertura nem encerramento.`;
  }

  const response = await client.chat.completions.create({
    model: DEFAULT_GPT_MODEL,
    messages: [
      {
        role: "system",
        content: "Você é redator oficial da CONTATO - Administração de Condomínios. Siga EXATAMENTE as especificações técnicas da empresa para validade jurídica.",
      },
      {
        role: "user",
        content: `Transforme este trecho de transcrição em ata formal seguindo as instruções:\n\n${instrucoes}\n\n**TRANSCRIÇÃO:**\n${bloco}`,
      },
    ],
    temperature: 0.05,
    max_tokens: 3000,
  });

  return response.choices[0].message.content.trim();
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * POST /api/ata/gerar
 * Gera ATA em texto (JSON response)
 */
router.post("/gerar", async (req, res) => {
  const { transcricao, info_assembleia } = req.body;

  if (!transcricao || !info_assembleia) {
    return res.status(400).json({ error: "Transcrição e informações da assembleia são obrigatórias" });
  }

  const campos = ["nome_condominio", "presidente_nome", "secretario_nome", "data_assembleia"];
  for (const campo of campos) {
    if (!info_assembleia[campo]?.trim()) {
      return res.status(400).json({ error: `Campo obrigatório ausente: ${campo}` });
    }
  }

  // SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    send("progress", { message: "Analisando transcrição..." });
    const blocos = dividirTranscricao(transcricao);
    const total = blocos.length;

    const resultados = [];
    for (let i = 0; i < blocos.length; i++) {
      send("progress", { message: `Processando seção ${i + 1} de ${total}...` });
      const resultado = await processarBloco(client, blocos[i], info_assembleia, i + 1, total);
      resultados.push(resultado);
    }

    send("progress", { message: "Finalizando ata..." });
    const ataFinal = resultados.join("\n\n");

    send("done", { ata: ataFinal });
    res.end();
  } catch (err) {
    console.error("Erro gerar ata:", err);
    send("error", { message: err.message });
    res.end();
  }
});

/**
 * POST /api/ata/download-docx
 * Gera e retorna DOCX para download (usando docx npm)
 */
router.post("/download-docx", async (req, res) => {
  const { ata_texto, info_assembleia } = req.body;

  if (!ata_texto) {
    return res.status(400).json({ error: "Texto da ata é obrigatório" });
  }

  try {
    const { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Packer } = require("docx");

    const nome = info_assembleia?.nome_condominio || "condominio";
    const data = info_assembleia?.data_assembleia || "data";
    const nomeLimpo = nome.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_").slice(0, 30).toLowerCase();
    const dataLimpa = data.replace(/\//g, "_");
    const nomeArquivo = `ata_${nomeLimpo}_${dataLimpa}.docx`;

    // Parsear negrito (**texto**)
    function parseRuns(linha) {
      const runs = [];
      const partes = linha.split(/(\*\*.*?\*\*)/g);
      for (const parte of partes) {
        if (parte.startsWith("**") && parte.endsWith("**")) {
          runs.push(new TextRun({ text: parte.slice(2, -2), bold: true, font: "Arial", size: 24 }));
        } else if (parte) {
          runs.push(new TextRun({ text: parte, font: "Arial", size: 24 }));
        }
      }
      return runs;
    }

    const paragrafos = [];

    // Título
    const nomeCondominio = info_assembleia?.nome_condominio?.toUpperCase() || "CONDOMÍNIO";
    const tipo = (info_assembleia?.tipo_assembleia || "EXTRAORDINÁRIA").toUpperCase();
    const dataStr = info_assembleia?.data_assembleia || "";

    paragrafos.push(
      new Paragraph({
        children: [new TextRun({ text: nomeCondominio, bold: true, font: "Arial", size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `ATA DA ASSEMBLEIA GERAL ${tipo} REALIZADA EM ${dataStr}`, bold: true, font: "Arial", size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
      })
    );

    // Conteúdo
    for (const linha of ata_texto.split("\n")) {
      if (!linha.trim()) {
        paragrafos.push(new Paragraph({ children: [], spacing: { after: 120 } }));
        continue;
      }
      paragrafos.push(
        new Paragraph({
          children: parseRuns(linha),
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 360, after: 120 }, // 1.5 spacing
        })
      );
    }

    // Assinaturas
    paragrafos.push(
      new Paragraph({ children: [], spacing: { after: 480 } }),
      new Paragraph({
        children: [
          new TextRun({ text: `Presidente: ${info_assembleia?.presidente_nome || ""}`, bold: true, font: "Arial", size: 24 }),
          new TextRun({ text: "\t\t\t\t", font: "Arial", size: 24 }),
          new TextRun({ text: `Secretário: ${info_assembleia?.secretario_nome || ""}`, bold: true, font: "Arial", size: 24 }),
        ],
        alignment: AlignmentType.LEFT,
      })
    );

    const doc = new Document({ sections: [{ children: paragrafos }] });
    const buffer = await Packer.toBuffer(doc);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo}"`);
    res.send(buffer);
  } catch (err) {
    console.error("Erro gerar DOCX:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
