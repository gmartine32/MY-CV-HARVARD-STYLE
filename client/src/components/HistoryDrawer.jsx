import React, { useState, useEffect } from "react";
import { X, Search, FileText, Calendar, HardDrive, RefreshCw, ArrowRight } from "lucide-react";

export function HistoryDrawer({ isOpen, onClose, onLoadCv }) {
  const [cvList, setCvList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterLang, setFilterLang] = useState("all");

  const fetchCvs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cvs");
      if (res.ok) {
        const data = await res.json();
        setCvList(data);
      }
    } catch (err) {
      console.error("Error fetching CVs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCvs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCvs = cvList.filter((cv) => {
    const matchesSearch = cv.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = filterLang === "all" || cv.lang === filterLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Historial de CVs</h2>
              <p className="text-xs text-slate-400">{cvList.length} archivos en el repositorio</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchCvs}
              title="Recargar"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por rol o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterLang("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterLang === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Todos ({cvList.length})
            </button>
            <button
              onClick={() => setFilterLang("es")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterLang === "es"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Español
            </button>
            <button
              onClick={() => setFilterLang("en")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterLang === "en"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCvs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No se encontraron archivos coincidentes.
            </div>
          ) : (
            filteredCvs.map((cv) => (
              <div
                key={cv.fileName}
                onClick={() => {
                  onLoadCv(cv.fileName);
                  onClose();
                }}
                className="group p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300">
                      {cv.fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(cv.modifiedAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        cv.lang === "en"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {cv.lang}
                    </span>
                    <span>{(cv.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition group-hover:translate-x-0.5" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
