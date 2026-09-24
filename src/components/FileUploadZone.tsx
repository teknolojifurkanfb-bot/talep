"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, Video, FileText, Loader2 } from "lucide-react";

export interface UploadedFileItem {
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType?: string;
  fileSize: number;
}

interface Props {
  files: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  maxFiles?: number;
}

export default function FileUploadZone({ files, onChange, maxFiles = 5 }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setError(null);

    if (files.length + selectedFiles.length > maxFiles) {
      setError(`En fazla ${maxFiles} dosya yükleyebilirsiniz.`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Dosya yüklenemedi.");
      }

      onChange([...files, ...data.files]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Dosya yüklenirken hata oluştu.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
            : "border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.docx,.xlsx,.txt,.log,.zip,.rar"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 text-blue-600">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {isUploading
                ? "Dosyalar sunucuya aktarılıyor..."
                : "Ekran görüntüsü, video kaydı veya dosya yükleyin"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Sürükleyip bırakın veya dosya seçmek için tıklayın (Görsel, MP4/WebM Video, PDF, Log vb.)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Yüklenen Dosyaların Listesi / Önizleme Kartları */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {files.map((file, idx) => {
            const isImg = file.fileType === "image";
            const isVid = file.fileType === "video";

            return (
              <div
                key={idx}
                className="relative flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs group hover:border-slate-300 transition-all"
              >
                <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.fileUrl}
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : isVid ? (
                    <Video className="w-5 h-5 text-purple-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate" title={file.fileName}>
                    {file.fileName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatSize(file.fileSize)} •{" "}
                    {isImg ? "Görsel" : isVid ? "Video Kaydı" : "Belge"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Dosyayı kaldır"
                >
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
