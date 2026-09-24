"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Monitor,
  KeyRound,
  HardDrive,
  Building2,
  User,
  Paperclip,
  Send,
  Lock,
  MessageSquare,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Flame,
  Loader2,
  Image as ImageIcon,
  Video,
  FileText,
  History,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import TicketStatusBadge, { TicketStatusType } from "@/components/TicketStatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import MediaViewerModal, { MediaItem } from "@/components/MediaViewerModal";
import FileUploadZone, { UploadedFileItem } from "@/components/FileUploadZone";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";

interface Props {
  params: Promise<{ id: string }>;
}

export default function TicketDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ticket, setTicket] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Comment & Action States
  const [commentText, setCommentText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [commentFiles, setCommentFiles] = useState<UploadedFileItem[]>([]);
  const [sendingComment, setSendingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modals & Tools
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const fetchTicketData = useCallback(async () => {
    try {
      const [ticketRes, userRes] = await Promise.all([
        fetch(`/api/tickets/${id}`),
        fetch("/api/auth/me"),
      ]);

      const ticketData = await ticketRes.json();
      const userData = await userRes.json();

      if (ticketRes.ok) {
        setTicket(ticketData.ticket);
      }
      setCurrentUser(userData.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);

  const handleStatusChange = async (newStatus: TicketStatusType) => {
    if (!ticket) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && commentFiles.length === 0) return;

    setSendingComment(true);
    try {
      const res = await fetch(`/api/tickets/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          isInternal: isInternalNote,
          attachments: commentFiles,
        }),
      });

      if (res.ok) {
        setCommentText("");
        setCommentFiles([]);
        setIsInternalNote(false);
        fetchTicketData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingComment(false);
    }
  };

  const copyToClipboard = (text: string, type: "id" | "pass") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleDeleteTicket = async () => {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/tickets");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Talep detayları yükleniyor...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">Talep bulunamadı veya yetkiniz yok.</p>
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft size={14} /> Taleplere Dön
        </Link>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isCompanyAdmin = currentUser?.role === "COMPANY_ADMIN";
  const canManageStatus = isSuperAdmin || isCompanyAdmin;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/tickets"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-2xs"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                #{ticket.ticketNumber}
              </span>
              <CategoryBadge category={ticket.category} />
              <PriorityBadge priority={ticket.priority} />
              <TicketStatusBadge status={ticket.status} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {ticket.title}
            </h1>
          </div>
        </div>

        {/* Status Dropdown (for IT / Admin) */}
        {canManageStatus && (
          <div className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-2xl shadow-2xs">
            <span className="text-xs font-semibold text-slate-600 pl-2">Durum:</span>
            <select
              value={ticket.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatusType)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACIK">🔵 Yeni Açıldı</option>
              <option value="ISLEMDE">🟡 İnceleniyor / İşlemde</option>
              <option value="BEKLEMEDE">🟣 Bilgi Bekleniyor</option>
              <option value="COZULDU">🟢 Çözüldü</option>
              <option value="KAPATILDI">⚫ Kapatıldı</option>
            </select>

            {isSuperAdmin && (
              <button
                onClick={handleDeleteTicket}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
                title="Talebi Sil"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* QUICK CONNECT CARD (Top Highlight for Home-Office IT Support) */}
      {(ticket.remoteId || ticket.contactPhone || ticket.deviceInfo) && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-5 md:p-6 rounded-3xl text-white shadow-xl border border-indigo-500/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Remote ID & Quick Launch */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Hızlı Uzaktan Müdahale & İletişim Masası
                </h3>
              </div>

              {ticket.remoteId ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
                    <Monitor className="w-5 h-5 text-indigo-400" />
                    <div>
                      <span className="text-[10px] text-slate-300 block font-medium">
                        {ticket.remoteApp || "AnyDesk"} Bağlantı ID
                      </span>
                      <span className="font-mono text-base md:text-lg font-bold text-white tracking-wider">
                        {ticket.remoteId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ticket.remoteId, "id")}
                      className="ml-2 p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
                      title="ID Kopyala"
                    >
                      {copiedId ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>

                  {ticket.remotePassword && (
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-[10px] text-slate-300 block font-medium">Şifre</span>
                        <span className="font-mono text-sm font-bold text-white">
                          {ticket.remotePassword}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(ticket.remotePassword, "pass")}
                        className="ml-1 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
                        title="Şifreyi Kopyala"
                      >
                        {copiedPass ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}

                  {/* Direct Protocol Launch */}
                  {ticket.remoteApp === "AnyDesk" && (
                    <a
                      href={`anydesk:${ticket.remoteId.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-1.5 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-[0.98]"
                    >
                      <ExternalLink size={14} />
                      <span>AnyDesk ile Bağlan</span>
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Uzaktan masaüstü ID belirtilmemiş. Aşağıdaki numaradan personelle iletişime geçebilirsiniz.
                </p>
              )}
            </div>

            {/* Right: Phone & WhatsApp & Device Details */}
            <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
              {ticket.contactPhone && (
                <>
                  <a
                    href={`tel:${ticket.contactPhone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Phone size={14} />
                    <span>Ara: {ticket.contactPhone}</span>
                  </a>

                  <a
                    href={`https://wa.me/${ticket.contactPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-emerald-300 rounded-2xl text-xs font-semibold backdrop-blur-md border border-white/15 transition-all"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                </>
              )}

              {ticket.deviceInfo && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-white/10 rounded-xl text-xs font-mono text-slate-300 border border-white/10">
                  <HardDrive size={13} className="text-blue-400" />
                  <span>{ticket.deviceInfo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left (Description, Attachments, Chat) & Right (Metadata, Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Content & Discussion */}
        <div className="lg:col-span-8 space-y-6">
          {/* Problem Description Card */}
          <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <span>Talep Açıklaması & Hata Bildirimi</span>
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>

            {/* Attached Media (Photos, Screen recordings, Logs) */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="pt-2 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip size={14} className="text-blue-600" />
                  <span>Yüklenen Ekran Görüntüleri ve Dosyalar ({ticket.attachments.length})</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ticket.attachments.map((att: MediaItem, index: number) => {
                    const isImg = att.fileType === "image";
                    const isVid = att.fileType === "video";

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedMedia(att)}
                        className="group relative bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-2xs hover:shadow-md"
                      >
                        <div className="h-28 bg-slate-200 flex items-center justify-center overflow-hidden relative">
                          {isImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={att.fileUrl}
                              alt={att.fileName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : isVid ? (
                            <div className="flex flex-col items-center gap-1 text-purple-700">
                              <Video size={28} />
                              <span className="text-[10px] font-bold">Video Kaydı (Oynat)</span>
                            </div>
                          ) : (
                            <FileText size={28} className="text-blue-600" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-black/70 text-white rounded-md text-[10px] font-semibold transition-opacity">
                              Görüntüle
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5">
                          <p className="text-xs font-semibold text-slate-800 truncate" title={att.fileName}>
                            {att.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400 capitalize">{att.fileType}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Conversation & Action Feed */}
          <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600" />
                <span>Destek Mesajlaşması & Yanıtlar ({ticket.comments?.length || 0})</span>
              </h3>
              <span className="text-xs text-slate-400">Tüm konuşma kayıt altındadır</span>
            </div>

            {/* Comments Stream */}
            <div className="space-y-4">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment: any) => {
                  const isITStaff = comment.user.role === "SUPER_ADMIN";
                  const isInternal = comment.isInternal;

                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isInternal
                          ? "bg-amber-50/80 border-amber-200 text-amber-950"
                          : isITStaff
                          ? "bg-blue-50/60 border-blue-200 text-slate-900"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              isITStaff ? "bg-blue-600" : "bg-slate-700"
                            }`}
                          >
                            {comment.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              {comment.user.name}
                            </span>
                            {isITStaff && (
                              <span className="ml-2 text-[10px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                Bilgi İşlem Yetkilisi
                              </span>
                            )}
                            {isInternal && (
                              <span className="ml-2 text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full flex-inline items-center gap-1">
                                <Lock size={10} /> Gizli İç Not (Sadece IT)
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap pl-9">
                        {comment.content}
                      </p>

                      {/* Comment Attachments if any */}
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="pl-9 pt-3 flex flex-wrap gap-2">
                          {comment.attachments.map((att: MediaItem, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedMedia(att)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                            >
                              <Paperclip size={12} className="text-blue-600" />
                              <span className="truncate max-w-[150px]">{att.fileName}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
                  Henüz bir yanıt veya mesaj eklenmedi. İlk yanıtı siz yazabilirsiniz.
                </div>
              )}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendComment} className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Yanıt Yaz / Mesaj Gönder
                </label>

                {/* Internal note switch (Only Super Admin) */}
                {isSuperAdmin && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <Lock size={12} />
                    <span>Gizli İç Not Olarak Kaydet (Müşteri Göremez)</span>
                  </label>
                )}
              </div>

              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  isInternalNote
                    ? "Sadece kendinizin veya diğer IT uzmanlarının görebileceği iç teknik not..."
                    : "Kullanıcıya veya destek ekibine iletilecek mesajınızı yazın..."
                }
                className={`w-full p-4 rounded-2xl text-sm outline-none transition-all border ${
                  isInternalNote
                    ? "bg-amber-50/50 border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                    : "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex-1">
                  <FileUploadZone files={commentFiles} onChange={setCommentFiles} maxFiles={3} />
                </div>

                <button
                  type="submit"
                  disabled={sendingComment || (!commentText.trim() && commentFiles.length === 0)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all self-end sm:self-auto"
                >
                  {sendingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      <span>{isInternalNote ? "İç Notu Kaydet" : "Yanıtı Gönder"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Ticket Meta, Company, History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Ticket Information Card */}
          <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Talep Özeti & Kurum
            </h3>

            {/* Company Info */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 block">Kurum / Firma</span>
              <p className="text-sm font-bold text-slate-900">{ticket.company?.name}</p>
              <p className="text-xs font-mono text-blue-600">Kod: {ticket.company?.code}</p>
            </div>

            {/* Reporter Info */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 block">Talebi Açan Personel</span>
              <p className="text-xs font-bold text-slate-900">{ticket.user?.name}</p>
              <p className="text-xs text-slate-500">{ticket.user?.department || "Bölüm belirtilmedi"}</p>
              <p className="text-xs text-slate-500">{ticket.user?.email}</p>
              {ticket.user?.phone && (
                <p className="text-xs font-mono text-slate-600">{ticket.user?.phone}</p>
              )}
            </div>

            {/* Priority Changer for Super Admin */}
            {isSuperAdmin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Öncelik Değiştir:
                </label>
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                >
                  <option value="DUSUK">Düşük</option>
                  <option value="NORMAL">Normal</option>
                  <option value="YUKSEK">Yüksek</option>
                  <option value="ACIL">🚨 Acil (Kritik)</option>
                </select>
              </div>
            )}

            {/* Dates */}
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Oluşturulma:</span>
                <span className="font-medium text-slate-700">
                  {format(new Date(ticket.createdAt), "dd.MM.yyyy HH:mm")}
                </span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Çözüm Tarihi:</span>
                  <span className="font-medium">
                    {format(new Date(ticket.resolvedAt), "dd.MM.yyyy HH:mm")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History size={14} className="text-blue-600" />
              <span>İşlem Geçmişi</span>
            </h3>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {ticket.history && ticket.history.length > 0 ? (
                ticket.history.map((h: any, idx: number) => (
                  <div key={idx} className="relative pl-7 text-xs">
                    <span className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-2xs" />
                    <p className="font-semibold text-slate-800">{h.actorName}</p>
                    <p className="text-slate-500 text-[11px]">
                      {h.action === "TALEP_ACILDI" || h.action === "TALEP_OLUSTURULDU"
                        ? "Talep oluşturuldu"
                        : h.action === "DURUM_DEGISTI"
                        ? `Durum: ${h.oldValue || "-"} ➜ ${h.newValue}`
                        : h.action === "ONCELIK_DEGISTI"
                        ? `Öncelik: ${h.oldValue || "-"} ➜ ${h.newValue}`
                        : h.action}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(h.createdAt), "dd MMM HH:mm", { locale: tr })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 pl-7">Geçmiş kaydı yok.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      <MediaViewerModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
    </div>
  );
}
