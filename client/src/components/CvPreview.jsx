import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Save,
  Eye,
  Edit3,
  Code2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Loader2,
  QrCode,
} from "lucide-react";

export function CvPreview({
  html,
  setHtml,
  fileName,
  setFileName,
  onSaveToRepo,
  onDownloadPdf,
  onToggleQr,
  isSaving,
  isExportingPdf,
  saveSuccess,
}) {
  const [viewMode, setViewMode] = useState("preview"); // 'preview' | 'inline-edit' | 'code'
  const [zoom, setZoom] = useState(1);
  const iframeRef = useRef(null);

  const hasQr = Boolean(html && html.includes("header-qr-box"));

  // Sync HTML into iframe
  useEffect(() => {
    if (iframeRef.current && (viewMode === "preview" || viewMode === "inline-edit")) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();

      if (viewMode === "inline-edit") {
        doc.body.contentEditable = "true";
        doc.body.style.outline = "none";
        doc.body.style.cursor = "text";

        // Listen for input changes in inline-edit mode
        const handleInput = () => {
          setHtml(doc.documentElement.outerHTML);
        };
        doc.body.addEventListener("input", handleInput);
        return () => {
          doc.body?.removeEventListener("input", handleInput);
        };
      }
    }
  }, [html, viewMode]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.6));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl h-[calc(100vh-6rem)]">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "preview"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista Harvard</span>
          </button>
          <button
            onClick={() => setViewMode("inline-edit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "inline-edit"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Haz clic sobre cualquier texto para editarlo directamente en la página"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edición Directa</span>
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "code"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Código HTML</span>
          </button>
        </div>

        {/* Center: File name input */}
        <div className="flex items-center gap-2 flex-1 max-w-xs min-w-[200px]">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="cv_rol_empresa_en.html"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Right: Zoom & Export Actions */}
        <div className="flex items-center gap-2">
          {viewMode !== "code" && (
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl px-1.5 py-1 text-slate-400">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:text-white rounded hover:bg-slate-800"
                title="Reducir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 w-10 text-center text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:text-white rounded hover:bg-slate-800"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 hover:text-white rounded hover:bg-slate-800 ml-0.5"
                title="100%"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Toggle QR Code */}
          <button
            onClick={onToggleQr}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              hasQr
                ? "bg-indigo-600/20 border-indigo-500/80 text-indigo-300 hover:bg-indigo-600/30"
                : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
            title="Activar o desactivar el código QR con enlace a tu portafolio en la cabecera"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>QR {hasQr ? "Activo" : "Off"}</span>
          </button>

          {/* Save to Repo */}
          <button
            onClick={onSaveToRepo}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              saveSuccess
                ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Save className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{saveSuccess ? "¡Guardado!" : "Guardar HTML"}</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={onDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 transition cursor-pointer active:scale-95"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Viewport */}
      <div className="flex-1 overflow-auto bg-slate-950/80 p-6 flex justify-center items-start">
        {viewMode === "code" ? (
          <div className="w-full h-full">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full h-full p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
            }}
            className="relative"
          >
            {viewMode === "inline-edit" && (
              <div className="mb-2 text-center">
                <span className="text-[11px] px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                  ✏️ Modo Edición Activo: Haz clic directamente en el texto del CV para cambiarlo
                </span>
              </div>
            )}
            <iframe
              ref={iframeRef}
              title="Harvard CV Preview"
              className="a4-sheet border-none rounded-sm shadow-2xl"
              style={{
                width: "210mm",
                height: "297mm",
                backgroundColor: "#fff",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
