"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { getPublicUrl } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  MapPin,
  Tag,
  User,
  Clock,
  MessageSquare,
  Pencil,
  Trash2,
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  UserCheck,
  ShieldCheck,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Image as ImageIcon,
  Star,
} from "lucide-react";

const IMAGE_EXT_REGEX = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;

function resolveAttachmentUrl(filePath: string): string {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return getPublicUrl("ticket-attachments", filePath);
}

function isImageAttachment(att: { fileType?: string | null; fileName?: string | null }): boolean {
  if (att.fileType && att.fileType.startsWith("image/")) return true;
  if (att.fileName && IMAGE_EXT_REGEX.test(att.fileName)) return true;
  return false;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface TicketDetail {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  resourceId: number | null;
  resourceName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdById: number;
  createdByName: string;
  createdByAvatar: string | null;
  assignedToId: number | null;
  assignedToName: string | null;
  assignedToAvatar: string | null;
  rejectionReason: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: { id: number; fileName: string; filePath: string; fileType: string; fileSize: number }[];
  rating: TicketRating | null;
  canRate: boolean;
}

interface TicketRating {
  stars: number;
  comment: string | null;
  ratedById: number;
  ratedByName: string | null;
  ratedAt: string;
  technicianId: number | null;
  technicianName: string | null;
}

interface TicketComment {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
}

interface TechnicianOption {
  id: number;
  name: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const LIFECYCLE_STEPS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function Stars({
  value,
  size = 16,
  className = "text-amber-400",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= value ? `${className} fill-current` : "text-gray-300"}
        />
      ))}
    </span>
  );
}

function StatusTimeline({ status }: { status: string }) {
  const isRejected = status === "REJECTED";
  const steps = isRejected
    ? ["OPEN", "REJECTED"]
    : LIFECYCLE_STEPS;
  const currentIdx = steps.indexOf(status);

  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isLast = idx === steps.length - 1;
        const isRejectStep = step === "REJECTED";

        let dotColor = "bg-gray-200 border-gray-300";
        let lineColor = "bg-gray-200";
        let labelColor = "text-muted";

        if (isCompleted) {
          dotColor = "bg-green-500 border-green-500";
          lineColor = "bg-green-500";
          labelColor = "text-green-700";
        } else if (isCurrent) {
          dotColor = isRejectStep
            ? "bg-red-500 border-red-500"
            : "bg-primary border-primary";
          labelColor = isRejectStep ? "text-red-700 font-semibold" : "text-primary font-semibold";
        }

        return (
          <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${dotColor} transition-colors`}
              >
                {isCompleted ? (
                  <CheckCircle size={14} className="text-white" />
                ) : isCurrent && isRejectStep ? (
                  <XCircle size={14} className="text-white" />
                ) : isCurrent ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                ) : null}
              </div>
              <span className={`text-[10px] mt-1.5 whitespace-nowrap ${labelColor}`}>
                {step.replace(/_/g, " ")}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-2 mt-[-18px] rounded ${isCompleted ? lineColor : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function IncidentDetailClient() {
  const params = useParams();
  const ticketId = params.id as string;
  const { user } = useAuth();

  const canManage = user?.role === "MANAGER" || user?.role === "ADMIN";
  const canUpdateStatus =
    user?.role === "TECHNICIAN" || user?.role === "MANAGER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("IN_PROGRESS");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState("");
  const [deleteCommentTarget, setDeleteCommentTarget] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [ratingStars, setRatingStars] = useState<number>(0);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string>("");

  const loadTicket = useCallback(async () => {
    try {
      const data = await apiFetch<TicketDetail>(`/api/tickets/${ticketId}`);
      setTicket(data);
      if (data.resolutionNotes) setResolutionNotes(data.resolutionNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket");
    }
  }, [ticketId]);

  const loadComments = useCallback(async () => {
    try {
      const data = await apiFetch<TicketComment[]>(`/api/tickets/${ticketId}/comments`);
      setComments(data);
    } catch {
      // non-fatal
    }
  }, [ticketId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadTicket(), loadComments()]);
      setLoading(false);
    };
    load();
  }, [loadTicket, loadComments]);

  const imageAttachments = (ticket?.attachments ?? []).filter(isImageAttachment);
  const hasLightbox = lightboxIndex !== null && imageAttachments[lightboxIndex];

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) =>
          i === null ? null : (i + 1) % imageAttachments.length,
        );
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) =>
          i === null
            ? null
            : (i - 1 + imageAttachments.length) % imageAttachments.length,
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, imageAttachments.length]);

  useEffect(() => {
    if (canManage) {
      apiFetch<TechnicianOption[]>("/api/tickets/technicians")
        .then((data) =>
          setTechnicians(data.map((t) => ({ id: t.id, name: t.name }))),
        )
        .catch(() => {});
    }
  }, [canManage]);

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    setSendingComment(true);
    try {
      await apiFetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: comment.trim() }),
      });
      setComment("");
      await loadComments();
    } catch {
      // ignore
    } finally {
      setSendingComment(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editingContent.trim()) return;
    try {
      await apiFetch(`/api/tickets/${ticketId}/comments/${commentId}`, {
        method: "PATCH",
        body: JSON.stringify({ content: editingContent.trim() }),
      });
      setEditingCommentId(null);
      setEditingContent("");
      await loadComments();
    } catch {
      // ignore
    }
  };

  const confirmDeleteComment = async () => {
    if (!deleteCommentTarget) return;
    try {
      await apiFetch(`/api/tickets/${ticketId}/comments/${deleteCommentTarget}`, {
        method: "DELETE",
      });
      setDeleteCommentTarget(null);
      await loadComments();
    } catch {
      setDeleteCommentTarget(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedTechnician) return;
    setUpdating(true);
    setActionError("");
    try {
      await apiFetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ assignedTo: Number(selectedTechnician) }),
      });
      await loadTicket();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to assign");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    setActionError("");
    try {
      await apiFetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: selectedStatus,
          resolutionNotes: resolutionNotes.trim() || null,
        }),
      });
      await loadTicket();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = async () => {
    setUpdating(true);
    setActionError("");
    try {
      await apiFetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CLOSED" }),
      });
      setShowCloseModal(false);
      await loadTicket();
    } catch (err) {
      setShowCloseModal(false);
      setActionError(err instanceof Error ? err.message : "Failed to close ticket");
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitRating = async () => {
    if (ratingStars < 1 || ratingStars > 5) {
      setRatingError("Please select a rating from 1 to 5 stars.");
      return;
    }
    setSubmittingRating(true);
    setRatingError("");
    try {
      await apiFetch(`/api/tickets/${ticketId}/rating`, {
        method: "POST",
        body: JSON.stringify({
          stars: ratingStars,
          comment: ratingComment.trim() || null,
        }),
      });
      setRatingStars(0);
      setRatingComment("");
      await loadTicket();
    } catch (err) {
      setRatingError(
        err instanceof Error ? err.message : "Failed to submit rating",
      );
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!reason?.trim()) return;
    setUpdating(true);
    setActionError("");
    try {
      await apiFetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "REJECTED", rejectionReason: reason.trim() }),
      });
      setShowRejectModal(false);
      await loadTicket();
    } catch (err) {
      setShowRejectModal(false);
      setActionError(err instanceof Error ? err.message : "Failed to reject ticket");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-[13px] text-muted">Loading ticket...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !ticket) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
            <p className="text-[14px] font-medium text-red-700">{error || "Ticket not found"}</p>
            <a href="/incidents/" className="mt-3 inline-block text-[13px] text-primary hover:underline">
              Back to incidents
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isClosed = ticket.status === "CLOSED" || ticket.status === "REJECTED";

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={ticket.title}
          subtitle={`#${ticket.code}`}
          backHref="/incidents/"
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          }
        />

        {/* Status Timeline */}
        <div className="rounded-xl bg-card-bg border border-border shadow-sm p-5 mb-6">
          <StatusTimeline status={ticket.status} />
        </div>

        {/* Rejection Banner */}
        {ticket.status === "REJECTED" && ticket.rejectionReason && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3">
            <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-red-800">Ticket Rejected</p>
              <p className="text-[13px] text-red-700 mt-1">{ticket.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Resolution Banner */}
        {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && ticket.resolutionNotes && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-6 flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-green-800">
                {ticket.status === "CLOSED" ? "Ticket Closed" : "Ticket Resolved"}
              </p>
              <p className="text-[13px] text-green-700 mt-1">{ticket.resolutionNotes}</p>
              {ticket.resolvedAt && (
                <p className="text-[11px] text-green-600 mt-1">
                  Resolved {timeAgo(ticket.resolvedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resolution Rating */}
        {ticket.rating ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
            <div className="flex items-start gap-3">
              <Star
                size={20}
                className="text-amber-500 fill-amber-500 shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-semibold text-amber-900">
                    Reporter rated this resolution
                  </p>
                  <Stars value={ticket.rating.stars} size={15} />
                  <span className="text-[12px] font-semibold text-amber-900">
                    {ticket.rating.stars}/5
                  </span>
                </div>
                {ticket.rating.comment && (
                  <p className="text-[13px] text-amber-900 mt-1.5 italic">
                    &ldquo;{ticket.rating.comment}&rdquo;
                  </p>
                )}
                <p className="text-[11px] text-amber-700 mt-1">
                  by {ticket.rating.ratedByName || "reporter"}
                  {ticket.rating.technicianName
                    ? ` for ${ticket.rating.technicianName}`
                    : ""}
                  {" \u00B7 "}
                  {timeAgo(ticket.rating.ratedAt)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          ticket.canRate &&
          user?.id === ticket.createdById && (
            <div className="rounded-xl bg-card-bg border border-amber-200 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Star size={18} className="text-amber-500" />
                <h3 className="text-[14px] font-semibold text-foreground">
                  How was the support you received?
                </h3>
              </div>
              <p className="text-[12.5px] text-muted mb-3">
                Your feedback helps us improve. Rate the resolution from 1 to 5
                stars
                {ticket.assignedToName ? ` for ${ticket.assignedToName}` : ""}.
              </p>

              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setRatingHover(n)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => setRatingStars(n)}
                    className="p-0.5 transition-transform hover:scale-110"
                    aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
                  >
                    <Star
                      size={28}
                      className={
                        n <= (ratingHover || ratingStars)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
                {ratingStars > 0 && (
                  <span className="ml-2 text-[13px] font-medium text-foreground">
                    {ratingStars}/5
                  </span>
                )}
              </div>

              <textarea
                rows={2}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Optional: leave a comment about the resolution..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
              />

              {ratingError && (
                <p className="text-[12px] text-red-600 mt-2">{ratingError}</p>
              )}

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitRating}
                  disabled={submittingRating || ratingStars === 0}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingRating && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Submit Rating
                </button>
              </div>
            </div>
          )
        )}

        <div className="space-y-6">
          {/* 1. Ticket Details */}
          <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
            <h2 className="text-[14px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText size={15} className="text-muted" />
              Ticket Details
            </h2>

            <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-line">
              {ticket.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mt-5 pt-5 border-t border-border">
              <div className="flex items-start gap-2.5 text-[13px]">
                <AlertTriangle size={15} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wide">Priority</p>
                  <div className="mt-0.5">
                    <StatusBadge status={ticket.priority} />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-[13px]">
                <ShieldCheck size={15} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wide">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-[13px]">
                <UserCheck size={15} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wide">Assigned To</p>
                  <p
                    className={`font-medium mt-0.5 ${ticket.assignedToName ? "text-foreground" : "text-muted italic"}`}
                  >
                    {ticket.assignedToName || "Unassigned"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-[13px]">
                <MapPin size={15} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wide">Location</p>
                  <p className="text-foreground font-medium">{ticket.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-[13px]">
                <Tag size={15} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wide">Category</p>
                  <p className="text-foreground font-medium">
                    {ticket.category.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              {ticket.resourceName && (
                <div className="flex items-start gap-2.5 text-[13px]">
                  <Building2 size={15} className="text-muted shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-muted uppercase tracking-wide">Resource</p>
                    <p className="text-foreground font-medium">{ticket.resourceName}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5 text-[13px]">
                <User size={15} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wide">Reported by</p>
                  <p className="text-foreground font-medium">{ticket.createdByName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-[13px]">
                <CalendarDays size={15} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wide">Created</p>
                  <p className="text-foreground font-medium">
                    {new Date(ticket.createdAt).toLocaleDateString()}{" "}
                    <span className="text-muted font-normal">
                      ({timeAgo(ticket.createdAt)})
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-[13px]">
                <Clock size={15} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wide">Last Updated</p>
                  <p className="text-foreground font-medium">{timeAgo(ticket.updatedAt)}</p>
                </div>
              </div>
            </div>

            {(ticket.contactEmail || ticket.contactPhone) && (
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-[11px] text-muted uppercase tracking-wide mb-2">
                  Contact Info
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {ticket.contactEmail && (
                    <div className="flex items-center gap-2 text-[13px]">
                      <Mail size={14} className="text-muted" />
                      <span className="text-foreground">{ticket.contactEmail}</span>
                    </div>
                  )}
                  {ticket.contactPhone && (
                    <div className="flex items-center gap-2 text-[13px]">
                      <Phone size={14} className="text-muted" />
                      <span className="text-foreground">{ticket.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {ticket.attachments.length > 0 && (
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-[11px] text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <ImageIcon size={12} />
                  Attachments ({ticket.attachments.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ticket.attachments.map((att) => {
                    const isImage = isImageAttachment(att);
                    const url = resolveAttachmentUrl(att.filePath);
                    if (isImage) {
                      const idx = imageAttachments.findIndex(
                        (a) => a.id === att.id,
                      );
                      return (
                        <button
                          key={att.id}
                          type="button"
                          onClick={() => setLightboxIndex(idx)}
                          className="group relative aspect-square rounded-lg bg-gray-50 border border-border overflow-hidden hover:ring-2 hover:ring-primary/50 hover:shadow-md transition-all"
                          title={att.fileName}
                        >
                          <img
                            src={url}
                            alt={att.fileName}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white truncate">
                              {att.fileName}
                            </p>
                            {att.fileSize > 0 && (
                              <p className="text-[9px] text-white/70">
                                {formatFileSize(att.fileSize)}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    }
                    return (
                      <a
                        key={att.id}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square flex flex-col items-center justify-center rounded-lg bg-gray-50 border border-border px-3 py-2 hover:ring-2 hover:ring-primary/40 hover:shadow-md transition-all"
                        title={att.fileName}
                      >
                        <FileText size={24} className="text-muted mb-1.5" />
                        <span className="text-[11px] text-foreground text-center line-clamp-2 break-all">
                          {att.fileName}
                        </span>
                        {att.fileSize > 0 && (
                          <span className="text-[10px] text-muted mt-0.5">
                            {formatFileSize(att.fileSize)}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Action Center */}
          {!isClosed && (canManage || canUpdateStatus) && (
            <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
              <h2 className="text-[14px] font-semibold text-foreground mb-4 flex items-center gap-2">
                <Wrench size={15} className="text-muted" />
                Action Center
              </h2>

              {actionError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 mb-4">
                  <p className="text-[12px] text-red-600">{actionError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Assign Technician */}
                {canManage && (
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-muted mb-1.5">
                      <UserCheck size={12} />
                      Assign Technician
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedTechnician}
                        onChange={(e) => setSelectedTechnician(e.target.value)}
                        className="h-9 flex-1 rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary"
                      >
                        <option value="">Select technician...</option>
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAssign}
                        disabled={updating || !selectedTechnician}
                        className="rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {updating ? "..." : "Assign"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Update Status */}
                {canUpdateStatus && (
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-muted mb-1.5">
                      <Wrench size={12} />
                      Update Status
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="h-9 flex-1 rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary"
                      >
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleUpdateStatus}
                        disabled={updating}
                        className="rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {updating ? "..." : "Update"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Notes */}
              {canUpdateStatus && (
                <div className="mt-5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-muted mb-1.5">
                    <FileText size={12} />
                    Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Add resolution notes before marking as resolved..."
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    Notes will be saved when you update status to Resolved.
                  </p>
                </div>
              )}

              {/* Close & Reject */}
              {canManage && (
                <div className="mt-5 pt-5 border-t border-border flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCloseModal(true)}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-[12px] font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    Close Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    Reject Ticket
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Discussion */}
          <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
            <h2 className="text-[14px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare size={15} className="text-muted" />
              Discussion ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted">
                <MessageSquare size={36} className="mb-2 opacity-30" />
                <p className="text-[13px]">No comments yet</p>
                <p className="text-[11px] mt-0.5">Be the first to add a comment</p>
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map((c) => {
                  const isOwn = c.userId === user?.id;
                  return (
                    <div key={c.id} className="flex gap-3 group">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[12px] font-semibold mt-1">
                        {c.userName?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0 rounded-xl bg-gray-50 border border-border/60 px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-foreground">
                            {c.userName}
                          </span>
                          <StatusBadge status={c.userRole} />
                          <span className="text-[11px] text-muted">
                            {timeAgo(c.createdAt)}
                          </span>
                          {c.isEdited && (
                            <span className="text-[10px] text-muted italic">
                              (edited)
                            </span>
                          )}
                        </div>
                        {editingCommentId === c.id ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="flex-1 h-8 rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditComment(c.id);
                                if (e.key === "Escape") setEditingCommentId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleEditComment(c.id)}
                              className="rounded-lg bg-primary px-3 py-1 text-[12px] font-medium text-white hover:bg-primary-dark"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="rounded-lg border border-border px-3 py-1 text-[12px] text-muted hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-[13px] text-foreground mt-1.5 leading-relaxed">
                            {c.content}
                          </p>
                        )}
                        {editingCommentId !== c.id && (isOwn || isAdmin) && (
                          <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isOwn && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommentId(c.id);
                                  setEditingContent(c.content);
                                }}
                                className="text-[11px] text-muted hover:text-primary flex items-center gap-1"
                              >
                                <Pencil size={11} /> Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteCommentTarget(c.id)}
                              className="text-[11px] text-muted hover:text-red-500 flex items-center gap-1"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isClosed && (
              <div className="mt-5 pt-4 border-t border-border flex gap-3">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 h-10 rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendComment();
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={sendingComment || !comment.trim()}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {sendingComment ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ConfirmModal
          open={deleteCommentTarget !== null}
          title="Delete Comment"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={confirmDeleteComment}
          onCancel={() => setDeleteCommentTarget(null)}
        />
        <ConfirmModal
          open={showCloseModal}
          title="Close Ticket"
          message="Are you sure you want to close this ticket? This marks the issue as fully resolved."
          confirmLabel="Close Ticket"
          variant="info"
          loading={updating}
          onConfirm={handleClose}
          onCancel={() => setShowCloseModal(false)}
        />
        <ConfirmModal
          open={showRejectModal}
          title="Reject Ticket"
          message="Please provide a reason for rejecting this ticket."
          confirmLabel="Reject"
          variant="danger"
          loading={updating}
          input={{ placeholder: "Enter rejection reason...", required: true }}
          onConfirm={handleReject}
          onCancel={() => setShowRejectModal(false)}
        />

        {hasLightbox && lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <XIcon size={20} />
            </button>

            <a
              href={resolveAttachmentUrl(imageAttachments[lightboxIndex].filePath)}
              download={imageAttachments[lightboxIndex].fileName}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 right-16 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Open original"
              title="Open original"
            >
              <Download size={18} />
            </a>

            {imageAttachments.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(
                      (lightboxIndex - 1 + imageAttachments.length) %
                        imageAttachments.length,
                    );
                  }}
                  className="absolute left-4 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(
                      (lightboxIndex + 1) % imageAttachments.length,
                    );
                  }}
                  className="absolute right-4 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <div
              className="relative max-w-[92vw] max-h-[88vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={resolveAttachmentUrl(
                  imageAttachments[lightboxIndex].filePath,
                )}
                alt={imageAttachments[lightboxIndex].fileName}
                className="max-w-[92vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-3 text-center text-white/90">
                <p className="text-[13px] font-medium">
                  {imageAttachments[lightboxIndex].fileName}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  {lightboxIndex + 1} of {imageAttachments.length}
                  {imageAttachments[lightboxIndex].fileSize > 0 &&
                    ` \u00B7 ${formatFileSize(imageAttachments[lightboxIndex].fileSize)}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
