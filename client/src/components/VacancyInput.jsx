import React from "react";
import { Sparkles, Globe, Building2, UserCircle2, Loader2, ClipboardPaste, QrCode } from "lucide-react";

export function VacancyInput({
  jobDescription,
  setJobDescription,
  targetRole,
  setTargetRole,
  company,
  setCompany,
  language,
  setLanguage,
  onGenerate,
  isGenerating,
  isKeyConfigured,
  onOpenSettings,
  hasQr,
  onToggleQr,
}) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setJobDescription(text);
    } catch {
      // Fallback
    }
  };

  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>🎯</span>
          <span>Vacante y Parámetros de Adaptación</span>
        </h2>
        {/* Language Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setLanguage("es")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              language === "es"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Español (ES)
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              language === "en"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            English (EN)
          </button>
        </div>
      </div>

      {/* Target Role & Company */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <UserCircle2 className="w-3.5 h-3.5 text-slate-500" />
            Rol Objetivo (Opcional)
          </label>
          <input
            type="text"
            placeholder="ej. Senior Frontend Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            Empresa (Opcional)
          </label>
          <input
            type="text"
            placeholder="ej. Makai / Addi / EPAM"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Job Description Textarea */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <label className="font-medium">Texto de la Vacante (Job Description):</label>
          <div className="flex items-center gap-3">
            <span>{wordCount} palabras</span>
            <button
              type="button"
              onClick={handlePaste}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
            >
              <ClipboardPaste className="w-3.5 h-3.5" /> Pegar Portapapeles
            </button>
          </div>
        </div>
        <textarea
          rows={7}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Pega aquí la descripción completa de la vacante (requisitos, responsabilidades, tecnologías solicitadas, stack técnico)..."
          className="w-full p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition leading-relaxed resize-none font-mono"
        />
      </div>

      {/* QR Code Option */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-slate-300">QR al Portafolio en Cabecera:</span>
        </div>
        <button
          type="button"
          onClick={onToggleQr}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            hasQr
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          {hasQr ? "✓ Activo (gianmartinez.space)" : "Desactivado"}
        </button>
      </div>

      {/* Generate Action Button */}
      <div>
        {!isKeyConfigured && (
          <p className="text-xs text-amber-400 mb-2 flex items-center gap-1.5">
            ⚠️ Necesitas configurar tu API Key antes de generar.{" "}
            <button
              onClick={onOpenSettings}
              className="underline hover:text-amber-300 font-medium cursor-pointer"
            >
              Configurar ahora
            </button>
          </p>
        )}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !jobDescription.trim()}
          className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition ${
            isGenerating || !jobDescription.trim()
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
              : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 cursor-pointer active:scale-[0.99]"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Adaptando CV con IA según Harvard Standard...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Generar CV Adaptado para esta Vacante</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
