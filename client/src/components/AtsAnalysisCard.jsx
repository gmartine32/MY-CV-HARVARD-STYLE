import React from "react";
import { Award, CheckCircle2, AlertTriangle, Lightbulb, FileCode } from "lucide-react";

export function AtsAnalysisCard({ analysis, suggestedFilename }) {
  if (!analysis) return null;

  const { atsScore, matchedKeywords = [], missingKeywords = [], highlightsSummary = [] } = analysis;

  const getScoreColor = (score) => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 70) return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Análisis de Relevancia ATS</h3>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-bold text-xs ${getScoreColor(
            atsScore
          )}`}
        >
          <span>Score ATS:</span>
          <span className="text-sm">{atsScore}%</span>
        </div>
      </div>

      {suggestedFilename && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-slate-400">Nombre sugerido:</span>
          <span className="font-mono text-indigo-300 font-semibold">{suggestedFilename}</span>
        </div>
      )}

      {/* Highlights */}
      {highlightsSummary.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Optimizaciones Estratégicas Aplicadas:
          </span>
          <ul className="space-y-1 text-xs text-slate-400 pl-4 list-disc marker:text-indigo-400">
            {highlightsSummary.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched Keywords */}
      {matchedKeywords.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Palabras Clave &amp; Tecnologías Coincidentes:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Requisitos de la Vacante no Presentes (Oportunidades de entrevista):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
