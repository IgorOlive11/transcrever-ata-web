<<<<<<< HEAD
# Transcrever ATA

Aplicação web para transcrever assembleias de condomínio e gerar atas formais com IA.

**Stack:** React + Vite + Tailwind CSS (cliente) · Node.js + Express (servidor)  
**APIs:** AssemblyAI (transcrição) · OpenAI GPT-4o (geração de ata)

---

## Estrutura

```
transcrever-ata/
├── client/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/   # Layout, AudioUploader, AssemblyInfoModal, etc.
│   │   ├── hooks/        # useTranscricao, useGerarAta
│   │   ├── pages/        # HomePage
│   │   └── utils/        # SSE parser
│   └── ...
└── server/               # Node.js + Express
    └── src/
        ├── routes/
        │   ├── transcricao.js  # POST /api/transcricao/transcrever (SSE)
        │   ├── ata.js          # POST /api/ata/gerar (SSE) + /download-docx
        │   └── ia.js           # POST /api/ia/detectar
        └── index.js
```

---

## Setup

### 1. Instalar dependências

```bash
npm run install:all
```

Ou manualmente:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp server/.env.example server/.env
```

Edite `server/.env`:
```
ASSEMBLYAI_API_KEY=sua_chave_assemblyai
OPENAI_API_KEY=sua_chave_openai
GPT_MODEL=gpt-4o
PORT=3001
CLIENT_URL=http://localhost:5173
```

### 3. Executar em desenvolvimento

```bash
npm run dev
```

Isso inicia:
- **Servidor:** http://localhost:3001
- **Cliente:** http://localhost:5173

---

## Funcionalidades

### Transcrição de Áudio
- Arraste e solte ou selecione arquivos MP3, WAV, M4A, AAC, OGG, WEBM, FLAC, MP4
- Transcrição via AssemblyAI com identificação de falantes
- Streaming SSE para feedback em tempo real
- Ou cole texto manualmente no editor

### Geração de Ata
- Modal para preenchimento de informações da assembleia
- Detecção automática de nome do condomínio e pautas via IA (OpenAI)
- Geração seguindo especificações da Contato Administrações
- Preview formatado com suporte a negrito e estrutura formal
- Download em `.docx` pronto para uso

### API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status das APIs |
| POST | `/api/transcricao/transcrever` | Transcreve áudio (SSE, multipart) |
| POST | `/api/ata/gerar` | Gera texto da ata (SSE, JSON) |
| POST | `/api/ata/download-docx` | Gera e baixa arquivo .docx |
| POST | `/api/ia/detectar` | Detecta info com IA (JSON) |

---

## Dependências principais

### Servidor
- `express` — framework HTTP
- `assemblyai` — transcrição de áudio
- `openai` — geração de ata com GPT-4o
- `multer` — upload de arquivos
- `docx` — geração de documentos Word

### Cliente
- `react` + `react-router-dom`
- `tailwindcss` — estilo utilitário
- `lucide-react` — ícones
- `clsx` — classes condicionais
=======
# transcrever-ata-web
>>>>>>> ee271f800495fe36cec6867a22f2e45861d3c2be
