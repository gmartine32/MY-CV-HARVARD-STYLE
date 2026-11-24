import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SettingsModal } from "./components/SettingsModal";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { VacancyInput } from "./components/VacancyInput";
import { AtsAnalysisCard } from "./components/AtsAnalysisCard";
import { CvPreview } from "./components/CvPreview";
import { AlertCircle, X } from "lucide-react";

export function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [company, setCompany] = useState("");
  const [language, setLanguage] = useState("es");
  const [html, setHtml] = useState("");
  const [fileName, setFileName] = useState("cv_fullstack.html");
  const [analysis, setAnalysis] = useState(null);

  // Settings in localStorage
  const [settings, setSettings] = useState(() => {
    let savedGeminiModel = localStorage.getItem("cv_gemini_model") || "gemini-3.8-flash";
    if (savedGeminiModel.includes("2.5")) {
      savedGeminiModel = "gemini-3.8-flash";
      localStorage.setItem("cv_gemini_model", "gemini-3.8-flash");
    }
    return {
      geminiKey: localStorage.getItem("cv_gemini_key") || "",
      openaiKey: localStorage.getItem("cv_openai_key") || "",
      provider: localStorage.getItem("cv_provider") || "gemini",
      geminiModel: savedGeminiModel,
      openaiModel: localStorage.getItem("cv_openai_model") || "gpt-4o",
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if API key is configured
  const isKeyConfigured = Boolean(
    settings.provider === "gemini" ? settings.geminiKey : settings.openaiKey
  );

  // Load canonical base CV on startup or language toggle
  const loadBaseCv = async (lang) => {
    try {
      const res = await fetch("/api/base-cvs");
      if (res.ok) {
        const data = await res.json();
        const baseHtml = lang === "en" ? data.en : data.es;
        if (baseHtml) {
          setHtml(baseHtml);
          setFileName(lang === "en" ? "cv_fullstack_en.html" : "cv_fullstack.html");
        }
      }
    } catch (err) {
      console.error("Error loading base CV:", err);
    }
  };

  useEffect(() => {
    loadBaseCv(language);
  }, [language]);

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem("cv_gemini_key", newSettings.geminiKey);
    localStorage.setItem("cv_openai_key", newSettings.openaiKey);
    localStorage.setItem("cv_provider", newSettings.provider);
    localStorage.setItem("cv_gemini_model", newSettings.geminiModel);
    localStorage.setItem("cv_openai_model", newSettings.openaiModel);
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    if (!isKeyConfigured) {
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const activeKey = settings.provider === "gemini" ? settings.geminiKey : settings.openaiKey;
      const activeModel =
        settings.provider === "gemini" ? settings.geminiModel : settings.openaiModel;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          targetRole,
          company,
          language,
          provider: settings.provider,
          apiKey: activeKey,
          model: activeModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al generar el CV");
      }

      if (data.html) {
        setHtml(data.html);
      }
      if (data.suggestedFilename) {
        setFileName(data.suggestedFilename);
      }
      setAnalysis({
        atsScore: data.atsScore,
        matchedKeywords: data.matchedKeywords,
        missingKeywords: data.missingKeywords,
        highlightsSummary: data.highlightsSummary,
      });
    } catch (err) {
      console.error("Generate error:", err);
      setErrorMessage(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToRepo = async () => {
    if (!html) return;
    setIsSaving(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          html,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!html) return;
    setIsExportingPdf(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          html,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al generar PDF");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName.replace(/\.html?$/i, "") + ".pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleLoadCvFromHistory = async (selectedFileName) => {
    try {
      const res = await fetch(`/api/cvs/${selectedFileName}`);
      if (res.ok) {
        const data = await res.json();
        setHtml(data.html);
        setFileName(data.fileName);
        if (data.fileName.endsWith("_en.html")) {
          setLanguage("en");
        } else if (data.fileName.endsWith("_es.html")) {
          setLanguage("es");
        }
      }
    } catch (err) {
      setErrorMessage("No se pudo cargar el CV seleccionado.");
    }
  };

  const hasQr = Boolean(html && html.includes("header-qr-box"));

  const handleToggleQr = async () => {
    if (!html) return;
    const willInclude = !hasQr;
    const label = language === "en" ? "Portfolio / Demos" : "Portafolio / Demos";
    try {
      const res = await fetch("/api/toggle-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, includeQr: willInclude, label }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.html) {
          setHtml(data.html);
        }
      }
    } catch (err) {
      console.error("Error toggling QR:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isKeyConfigured={isKeyConfigured}
        activeProvider={settings.provider}
        onResetBase={() => loadBaseCv(language)}
        currentLanguage={language}
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-950/80 border-b border-red-800 text-red-200 px-6 py-2.5 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="text-red-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Studio Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1900px] w-full mx-auto">
        {/* Left Column: Input & ATS Analysis (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-6rem)] pr-1">
          <VacancyInput
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            company={company}
            setCompany={setCompany}
            language={language}
            setLanguage={setLanguage}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            isKeyConfigured={isKeyConfigured}
            onOpenSettings={() => setIsSettingsOpen(true)}
            hasQr={hasQr}
            onToggleQr={handleToggleQr}
          />

          <AtsAnalysisCard
            analysis={analysis}
            suggestedFilename={analysis ? fileName : null}
          />
        </div>

        {/* Right Column: Live Harvard Preview & Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <CvPreview
            html={html}
            setHtml={setHtml}
            fileName={fileName}
            setFileName={setFileName}
            onSaveToRepo={handleSaveToRepo}
            onDownloadPdf={handleDownloadPdf}
            onToggleQr={handleToggleQr}
            isSaving={isSaving}
            isExportingPdf={isExportingPdf}
            saveSuccess={saveSuccess}
          />
        </div>
      </main>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadCv={handleLoadCvFromHistory}
      />
    </div>
  );
}

export default App;
