import fs from "node:fs";
import path from "node:path";

function cleanJsonString(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }
  return cleaned.trim();
}

/**
 * Builds the comprehensive prompt for AI CV tailoring
 */
export function buildTailoringPrompt({
  baseCvHtml,
  jobDescription,
  targetRole,
  company,
  language,
}) {
  const langText = language === "en" ? "English" : "Spanish";

  return `You are an elite Tech Recruiter & ATS Optimization Specialist. Your goal is to tailor the candidate's canonical Harvard-format CV for a specific job description (JD) with 100% truthfulness and precision.

### CANDIDATE IDENTITY & CANONICAL RULES (STRICT SOURCE OF TRUTH):
- Candidate: Gian Franco Martinez Villa
- Location: Barranquilla, Colombia (Remote • CST overlap)
- Portfolio: https://gianmartinez.space (never use lmcoding.dev or other domain)
- LinkedIn: https://linkedin.com/in/gianmartinezvilla
- Email: gianfrancovillam@gmail.com
- Phone: +57 314 704 6296

### STRICT GOLDEN RULES (DO NOT HALLUCINATE OR CHANGE):
1. **Devitech S.A.S – Terpel** is the ONLY company active in "Present / Actualidad" (November 2021 – Present / Noviembre 2021 – Actualidad). It demonstrates stability and long-term impact on high-scale systems (750+ service stations).
2. **Papyria**: January 2024 – January 2025 / Enero 2024 – Enero 2025. Tag: Personal Project / Independent Product (Proyecto Personal / Producto Independiente). Never name it "InkMind" or "Inmind".
3. **Populi S.A.**: 2024 – 2025. Tag: Independent / Project Contract (Independiente / Contrato por Proyectos). Never use "Freelance" for Populi; highlight fast delivery of complete platforms: Premios Perrenque, Landing Haceb, ODR Logística.
4. **Devitech – Targeted project (Proyecto puntual)**: May 2025 – June 2025 / Mayo 2025 – Junio 2025. Tag: Consulting / Targeted project (Consultoría / Proyecto puntual).
5. **Carnes Santa Cruz**: May 2024 / Mayo 2024. Tag: Independent.
6. **MoviSAI**: September 2024 – December 2024 / Septiembre 2024 – Diciembre 2024. Tag: Temporary Project (Proyecto Temporal).
7. **Begima / Beefree / Kiiex**: Tagged as Freelance with their closed dates.
8. **DO NOT invent any company, do not invent dates, do not fabricate technologies** Gian has not worked with.
9. **AI-Augmented Developer Identity**: Position Gian as an engineer who leverages AI-assisted development tools (Cursor, Claude Code, RAG, Spec-Driven Development, Prompt & Context Engineering) to achieve up to 2.5x delivery speed with high architectural rigor (SOLID, Clean Architecture, Human-in-the-loop review).
10. **Quantifiable Metrics (XYZ formula)**: Maintain real metrics (750+ service stations, −40% load times, −50% deployment cycles, +20% organic traffic).
11. **Harvard Layout Consistency**: Preserve the Georgia typography, A4 page dimensions, flex headers with right-aligned dates, clean sections, strategic \`<strong>\` tags on keywords and metrics, and ensure the content fits cleanly without awkward orphan lines.
12. **Portfolio QR Code**: Maintain the header QR code block pointing to https://gianmartinez.space in the top-right corner of the header container.
13. **Language**: The output CV must be completely in **${langText}**.

---
### JOB DESCRIPTION TO TARGET:
Role specified by user (if any): ${targetRole || "Auto-detect from JD"}
Target Company (if any): ${company || "Auto-detect from JD"}

JD Text:
${jobDescription}

---
### CANONICAL BASE CV HTML:
${baseCvHtml}

---
### REQUIRED OUTPUT:
Return ONLY a valid JSON object (no surrounding commentary, no markdown outside JSON) with this exact schema:
{
  "detectedRole": "Slug of the role (e.g. frontend, fullstack, backend, ui_engineer, mobile, ai_engineer)",
  "detectedCompany": "Slug of the company (e.g. epam, addi, makai, wizeline, talenthive)",
  "suggestedFilename": "cv_<role>_<company>_<lang>.html (e.g. cv_frontend_makai_en.html)",
  "atsScore": 88,
  "matchedKeywords": ["React", "TypeScript", "Next.js", "Design Systems", "WebSockets"],
  "missingKeywords": ["GraphQL", "Kubernetes"],
  "highlightsSummary": [
    "Adapted headline to highlight Senior UI Engineer and AI-powered interfaces",
    "Emphasized React, Tailwind CSS and Design Tokens based on JD requirements",
    "Reordered skills section prioritizing frontend architecture and accessibility (WCAG 2.1 AA)"
  ],
  "html": "<!DOCTYPE html>...full complete valid HTML tailored CV in Harvard format..."
}
`;
}

/**
 * Call Gemini API directly via fetch
 */
export async function callGemini({ apiKey, model = "gemini-3.8-flash", prompt }) {
  let cleanModel = (model || "gemini-3.8-flash").replace(/^models\//, "").trim();
  // Automatic migration for deprecated model names reported by Google
  if (cleanModel === "gemini-2.5-flash" || cleanModel === "gemini-2.5-pro") {
    cleanModel = cleanModel.replace("2.5", "3.8");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text response received from Gemini.");
  }

  return JSON.parse(cleanJsonString(text));
}

/**
 * Fetch available models dynamically for this Gemini API key
 */
export async function fetchGeminiModels(apiKey) {
  const fallbackModels = [
    { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Recomendado oficial por Google, ultra rápido)", isRecommended: true },
    { id: "gemini-3.8-pro", name: "Gemini 3.8 Pro (Máxima capacidad de razonamiento)" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  ];

  if (!apiKey) return fallbackModels;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return fallbackModels;

    const data = await res.json();
    if (!data.models || !Array.isArray(data.models)) return fallbackModels;

    const contentModels = data.models
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => {
        const id = m.name.replace(/^models\//, "");
        return {
          id,
          name: `${m.displayName || id} (${id})`,
          description: m.description,
          isRecommended: id === "gemini-1.5-flash" || id === "gemini-2.0-flash",
        };
      });

    return contentModels.length > 0 ? contentModels : fallbackModels;
  } catch {
    return fallbackModels;
  }
}

/**
 * Call OpenAI API directly via fetch
 */
export async function callOpenAI({ apiKey, model = "gpt-4o", prompt }) {
  const url = "https://api.openai.com/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are an elite Tech Recruiter & ATS Optimization Specialist. You always output valid JSON adhering strictly to the candidate's canonical career facts.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("No response received from OpenAI.");
  }

  return JSON.parse(cleanJsonString(text));
}
