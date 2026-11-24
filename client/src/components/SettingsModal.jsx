import React, { useState, useEffect } from "react";
import { X, Key, ShieldCheck, Sparkles, ExternalLink, RefreshCw, Edit3 } from "lucide-react";

export function SettingsModal({ isOpen, onClose, onSave, currentSettings }) {
  const [geminiKey, setGeminiKey] = useState(currentSettings.geminiKey || "");
  const [openaiKey, setOpenaiKey] = useState(currentSettings.openaiKey || "");
  const [provider, setProvider] = useState(currentSettings.provider || "gemini");
  const [geminiModel, setGeminiModel] = useState(
    currentSettings.geminiModel && !currentSettings.geminiModel.includes("2.5")
      ? currentSettings.geminiModel
      : "gemini-3.8-flash"
  );
  const [openaiModel, setOpenaiModel] = useState(currentSettings.openaiModel || "gpt-4o");

  const [availableGeminiModels, setAvailableGeminiModels] = useState([
    { id: "gemini-3.8-flash", name: "gemini-3.8-flash (Recomendado oficial por Google, ultra rápido)", isRecommended: true },
    { id: "gemini-3.8-pro", name: "gemini-3.8-pro (Máxima capacidad de razonamiento)" },
    { id: "gemini-2.0-flash", name: "gemini-2.0-flash (Generación 2.0)" },
    { id: "gemini-1.5-flash", name: "gemini-1.5-flash" },
    { id: "gemini-1.5-pro", name: "gemini-1.5-pro" },
  ]);

  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [customModelMode, setCustomModelMode] = useState(false);

  useEffect(() => {
    setGeminiKey(currentSettings.geminiKey || "");
    setOpenaiKey(currentSettings.openaiKey || "");
    setProvider(currentSettings.provider || "gemini");
    setGeminiModel(
      currentSettings.geminiModel && !currentSettings.geminiModel.includes("2.5")
        ? currentSettings.geminiModel
        : "gemini-3.8-flash"
    );
    setOpenaiModel(currentSettings.openaiModel || "gpt-4o");
  }, [currentSettings, isOpen]);

  const handleFetchModels = async () => {
    if (!geminiKey.trim()) return;
    setIsLoadingModels(true);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "gemini", apiKey: geminiKey.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setAvailableGeminiModels(data.models);
          // If current model not in fetched, select the first or recommended
          const exists = data.models.some((m) => m.id === geminiModel);
          if (!exists) {
            setGeminiModel(data.models[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching live models:", err);
    } finally {
      setIsLoadingModels(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      geminiKey: geminiKey.trim(),
      openaiKey: openaiKey.trim(),
      provider,
      geminiModel: geminiModel.trim(),
      openaiModel: openaiModel.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Configuración de API &amp; Modelos</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Privacy Note */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Tus claves se guardan localmente en tu navegador (<span className="text-emerald-300 font-mono">localStorage</span>). Nunca se comparten con terceros ni servidores externos.
            </p>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Proveedor por Defecto
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider("gemini")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition ${
                  provider === "gemini"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/40"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => setProvider("openai")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition ${
                  provider === "openai"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span>⚡</span>
                OpenAI
              </button>
            </div>
          </div>

          {/* Gemini Settings */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                Google Gemini API Key
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-normal">Recomendado</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                Obtener en AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition"
            />

            {/* Model Selection & Custom Name */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Modelo Gemini:</span>
                <div className="flex items-center gap-2">
                  {geminiKey.trim() && (
                    <button
                      type="button"
                      onClick={handleFetchModels}
                      disabled={isLoadingModels}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      title="Verificar modelos activos para tu cuenta en Google AI Studio"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingModels ? "animate-spin" : ""}`} />
                      Detectar de mi cuenta
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCustomModelMode(!customModelMode)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    {customModelMode ? "Usar lista" : "Escribir nombre"}
                  </button>
                </div>
              </div>

              {customModelMode ? (
                <input
                  type="text"
                  placeholder="ej. gemini-1.5-flash o gemini-2.0-flash"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-500/60 text-xs text-indigo-200 font-mono focus:outline-none"
                />
              ) : (
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {availableGeminiModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.id}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-slate-500">
                Google utiliza identificadores como <code className="text-slate-400 font-mono">gemini-1.5-flash</code> o <code className="text-slate-400 font-mono">gemini-2.0-flash</code>.
              </p>
            </div>
          </div>

          {/* OpenAI Settings */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-200">
                OpenAI API Key
              </label>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1 transition"
              >
                Dashboard OpenAI <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
            />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Modelo OpenAI:</span>
              <select
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
              >
                <option value="gpt-4o">gpt-4o (Recomendado)</option>
                <option value="gpt-4o-mini">gpt-4o-mini (Ultra rápido y económico)</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
