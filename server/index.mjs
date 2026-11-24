import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePdfFromHtml } from "./pdfService.mjs";
import { buildTailoringPrompt, callGemini, callOpenAI, fetchGeminiModels } from "./aiService.mjs";
import { generateQrSvg, getPortfolioQrHtmlComponent, injectQrIntoCvHtml } from "./qrService.mjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PDF_DIR = path.resolve(ROOT_DIR, "pdf");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Health check
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    hasEnvGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasEnvOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  });
});

// Get base CVs
app.get("/api/base-cvs", (req, res) => {
  try {
    const esPath = path.join(ROOT_DIR, "cv_fullstack.html");
    const enPath = path.join(ROOT_DIR, "cv_fullstack_en.html");

    const esHtml = fs.existsSync(esPath) ? fs.readFileSync(esPath, "utf-8") : "";
    const enHtml = fs.existsSync(enPath) ? fs.readFileSync(enPath, "utf-8") : "";

    res.json({ es: esHtml, en: enHtml });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all generated CV files
app.get("/api/cvs", (req, res) => {
  try {
    const files = fs.readdirSync(ROOT_DIR).filter((f) => f.startsWith("cv_") && f.endsWith(".html"));

    const cvList = files.map((fileName) => {
      const filePath = path.join(ROOT_DIR, fileName);
      const stats = fs.statSync(filePath);
      
      // Attempt to extract role, company, lang
      // Pattern: cv_<role>_<company>_<lang>.html or cv_<role>_<lang>.html or cv_<role>.html
      const withoutExt = fileName.replace(/^cv_/, "").replace(/\.html$/, "");
      const parts = withoutExt.split("_");
      let lang = "es";
      if (parts[parts.length - 1] === "en" || parts[parts.length - 1] === "es") {
        lang = parts[parts.length - 1];
      }

      return {
        fileName,
        size: stats.size,
        modifiedAt: stats.mtime,
        lang,
      };
    });

    // Sort by most recently modified
    cvList.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

    res.json(cvList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Load a specific CV
app.get("/api/cvs/:fileName", (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName);
    const filePath = path.join(ROOT_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "CV file not found" });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    res.json({ fileName, html: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save tailored CV HTML to repo
app.post("/api/save", (req, res) => {
  try {
    let { fileName, html } = req.body;
    if (!fileName || !html) {
      return res.status(400).json({ error: "fileName and html are required." });
    }

    if (!fileName.startsWith("cv_")) {
      fileName = `cv_${fileName}`;
    }
    if (!fileName.endsWith(".html")) {
      fileName = `${fileName}.html`;
    }

    // Sanitize filename
    const safeFileName = path.basename(fileName);
    const targetPath = path.join(ROOT_DIR, safeFileName);

    fs.writeFileSync(targetPath, html, "utf-8");

    res.json({ success: true, fileName: safeFileName, path: targetPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF
app.post("/api/pdf", async (req, res) => {
  try {
    const { html, fileName = "cv_generated.pdf" } = req.body;
    if (!html) {
      return res.status(400).json({ error: "html content is required." });
    }

    const cleanBaseName = path.basename(fileName).replace(/\.html?$/i, "") + ".pdf";
    const outputPath = path.join(PDF_DIR, cleanBaseName);

    const pdfBuffer = await generatePdfFromHtml(html, outputPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanBaseName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get portfolio QR code
app.get("/api/qr", async (req, res) => {
  try {
    const { url = "https://gianmartinez.space", size = 46, label = "Portafolio / Demos" } = req.query;
    const svg = await generateQrSvg(url, Number(size));
    const htmlComponent = await getPortfolioQrHtmlComponent({ url, size: Number(size), label });
    res.json({ svg, htmlComponent, url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle QR in CV HTML
app.post("/api/toggle-qr", async (req, res) => {
  try {
    const { html, includeQr = true, label = "Portafolio / Demos" } = req.body;
    if (!html) {
      return res.status(400).json({ error: "html is required." });
    }
    const updatedHtml = await injectQrIntoCvHtml(html, { includeQr, label });
    res.json({ html: updatedHtml });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch available models
app.post("/api/models", async (req, res) => {
  try {
    const { provider = "gemini", apiKey } = req.body;
    if (provider === "gemini") {
      const effectiveKey = apiKey || process.env.GEMINI_API_KEY;
      const models = await fetchGeminiModels(effectiveKey);
      return res.json({ models });
    } else {
      return res.json({
        models: [
          { id: "gpt-4o", name: "GPT-4o (Recomendado, multimodal y rápido)" },
          { id: "gpt-4o-mini", name: "GPT-4o Mini (Económico y veloz)" },
          { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
        ],
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to generate CV
app.post("/api/generate", async (req, res) => {
  try {
    const {
      jobDescription,
      targetRole,
      company,
      language = "es",
      provider = "gemini",
      apiKey,
      model,
    } = req.body;

    if (!jobDescription || jobDescription.trim().length < 15) {
      return res.status(400).json({ error: "Please provide a valid Job Description." });
    }

    const effectiveApiKey =
      apiKey ||
      (provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);

    if (!effectiveApiKey) {
      return res.status(400).json({
        error: `Missing API Key for provider "${provider}". Please supply an API key in the UI settings or .env file.`,
      });
    }

    // Read the canonical base CV
    const baseFile = language === "en" ? "cv_fullstack_en.html" : "cv_fullstack.html";
    const baseCvPath = path.join(ROOT_DIR, baseFile);

    if (!fs.existsSync(baseCvPath)) {
      return res.status(500).json({ error: `Base CV file not found at ${baseCvPath}` });
    }

    const baseCvHtml = fs.readFileSync(baseCvPath, "utf-8");

    const prompt = buildTailoringPrompt({
      baseCvHtml,
      jobDescription,
      targetRole,
      company,
      language,
    });

    let result;
    if (provider === "gemini") {
      result = await callGemini({
        apiKey: effectiveApiKey,
        model: model || "gemini-3.8-flash",
        prompt,
      });
    } else if (provider === "openai") {
      result = await callOpenAI({
        apiKey: effectiveApiKey,
        model: model || "gpt-4o",
        prompt,
      });
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    res.json(result);
  } catch (error) {
    console.error("Tailoring error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Static frontend serving if built
const clientDist = path.join(ROOT_DIR, "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

app.use((req, res) => {
  const indexHtml = path.join(clientDist, "index.html");
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).json({ error: "Endpoint not found" });
  }
});

app.listen(PORT, () => {
  console.log(`CV Harvard Generator Backend listening on http://localhost:${PORT}`);
});
