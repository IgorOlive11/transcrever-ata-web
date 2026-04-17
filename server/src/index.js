require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const auth = require('./midlewares/auth')

const transcricaoRoutes = require("./routes/transcricao");
const ataRoutes = require("./routes/ata");
const iaRoutes = require("./routes/ia");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos gerados
app.use("/downloads", express.static(path.join(__dirname, "../downloads")));

// Rotas
app.use("/api/transcricao", auth, transcricaoRoutes);
app.use("/api/ata", auth, ataRoutes);
app.use("/api/ia", auth, iaRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    assemblyai: !!process.env.ASSEMBLYAI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  });
});

// Garantir pasta de downloads
const fs = require("fs");
const downloadsDir = path.join(__dirname, "../downloads");
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 AssemblyAI: ${process.env.ASSEMBLYAI_API_KEY ? "✅" : "❌"}`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? "✅" : "❌"}`);
});
