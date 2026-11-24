import React from "react";
import { Sparkles, Settings, History, CheckCircle2, AlertCircle } from "lucide-react";

export function Header({
  onOpenSettings,
  onOpenHistory,
  isKeyConfigured,
  activeProvider,
  onResetBase,
  currentLanguage,
}) {
  return (
    <header className="h-16 px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">Harvard CV Studio AI</h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Gian Martinez Edition
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Adaptación quirúrgica de CVs según JD con formato canónico y métricas reales
          </p>
        </div>
      </div>

      {/* Actions & Status */}
      <div className="flex items-center gap-3">
        {/* Reset Base CV */}
        <button
          onClick={onResetBase}
          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition"
          title={`Restablecer a la base oficial (${currentLanguage === "en" ? "cv_fullstack_en.html" : "cv_fullstack.html"})`}
        >
          Cargar Base Oficial ({currentLanguage.toUpperCase()})
        </button>

        {/* History Button */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition shadow-xs"
        >
          <History className="w-4 h-4 text-emerald-400" />
          <span>Historial Repo</span>
        </button>

        {/* API Key Status Pill & Settings Button */}
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition ${
            isKeyConfigured
              ? "bg-indigo-950/40 border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/40"
              : "bg-amber-950/40 border-amber-700/60 text-amber-300 hover:bg-amber-900/40 animate-pulse"
          }`}
        >
          {isKeyConfigured ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
          <span>
            {isKeyConfigured
              ? `IA Lista (${activeProvider === "gemini" ? "Gemini" : "OpenAI"})`
              : "Configurar API Key"}
          </span>
          <Settings className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>
      </div>
    </header>
  );
}
