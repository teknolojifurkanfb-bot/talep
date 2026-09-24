"use client";

import React, { useEffect } from "react";
import { X, Download, ExternalLink, FileText } from "lucide-react";

export interface MediaItem {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
}

interface Props {
  media: MediaItem | null;
  onClose: () => void;
}

export default function MediaViewerModal({ media, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!media) return null;

  const isImg = media.fileType === "image";
  const isVid = media.fileType === "video";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-850 border-b border-slate-700/80 text-white">
          <div className="flex items-center gap-2 truncate pr-4">
            <span className="text-xs px-2 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 font-medium">
              {isImg ? "Görsel" : isVid ? "Video" : "Dosya"}
            </span>
            <p className="text-sm font-medium truncate" title={media.fileName}>
              {media.fileName}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={media.fileUrl}
              download={media.fileName}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="İndir"
            >
              <Download size={18} />
            </a>
            <a
              href={media.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Yeni sekmede aç"
            >
              <ExternalLink size={18} />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-600/80 rounded-lg transition-colors ml-2"
              title="Kapat (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950/60 min-h-[300px]">
          {isImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.fileUrl}
              alt={media.fileName}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
            />
          ) : isVid ? (
            <video
              src={media.fileUrl}
              controls
              autoPlay
              className="max-w-full max-h-[75vh] rounded-lg shadow-lg"
            >
              Tarayıcınız video etiketini desteklemiyor.
            </video>
          ) : (
            <div className="text-center py-12 text-slate-300">
              <FileText className="w-16 h-16 mx-auto mb-3 text-blue-400 opacity-80" />
              <p className="font-medium text-base mb-1">{media.fileName}</p>
              <p className="text-xs text-slate-400 mb-4">
                Bu dosya türü doğrudan tarayıcıda önizlenemiyor.
              </p>
              <a
                href={media.fileUrl}
                download={media.fileName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
              >
                <Download size={14} /> Dosyayı İndir
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
