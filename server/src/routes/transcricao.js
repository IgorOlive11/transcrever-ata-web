const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { AssemblyAI } = require("assemblyai");

const router = express.Router();

// Multer config — salvar temporariamente
const upload = multer({
  dest: path.join(__dirname, "../../uploads/"),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = /mp3|wav|m4a|aac|ogg|webm|flac|mp4/i;
    const ext = path.extname(file.originalname).slice(1);
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error("Formato de arquivo não suportado"));
  },
});

// Garantir pasta uploads
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/**
 * POST /api/transcricao/transcrever
 * Recebe arquivo de áudio, transcreve com AssemblyAI via SSE
 */
router.post("/transcrever", upload.single("audio"), async (req, res) => {
  const filePath = req.file?.path;

  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const cleanup = () => {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  };

  try {
    send("progress", { message: "Conectando ao AssemblyAI..." });

    const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

    send("progress", { message: "Enviando arquivo para transcrição..." });

    const transcript = await client.transcripts.transcribe({
      audio: filePath,
      language_code: "pt",
      speaker_labels: true,
      punctuate: true,
      format_text: true,
    });

    if (transcript.status === "error") {
      throw new Error(transcript.error || "Erro na transcrição");
    }

    send("progress", { message: "Processando resultado..." });

    // Enviar texto completo
    send("text_chunk", { text: transcript.text });

    // Enviar dados completos com timestamps
    send("full_data", {
      text: transcript.text,
      words: transcript.words || [],
      utterances: transcript.utterances || [],
      metadata: {
        id: transcript.id,
        confidence: transcript.confidence,
        audio_duration: transcript.audio_duration,
        language_code: transcript.language_code,
        words_count: (transcript.words || []).length,
      },
    });

    send("done", { message: "Transcrição concluída" });

    cleanup();
    res.end();
  } catch (err) {
    console.error("Erro transcrição:", err);
    send("error", { message: err.message });
    cleanup();
    res.end();
  }
});

module.exports = router;
