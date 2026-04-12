"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
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
} from "lucide-react";

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
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState("");
  const [deleteCommentTarget, setDeleteCommentTarget] = useState<number | null>(null);

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
      await loadTicket();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to close ticket");
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setActionError("Please provide a rejection reason");
      return;
    }
    setUpdating(true);
    setActionError("");
    try {
      await apiFetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "REJECTED", rejectionReason: rejectionReason.trim() }),
      });
      setShowRejectDialog(false);
      setRejectionReason("");
      await loadTicket();
    } catch (err) {
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
            <p className="text-[13px] text-red-600">{error || "Ticket not found"}</p>
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
          title={`#${ticket.code} ${ticket.title}`}
          backHref="/incidents/"
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-foreground mb-4">
                Incident Details
              </h2>
              <p className="text-[14px] text-foreground leading-relaxed mb-5">
                {ticket.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-[13px]">
                  <MapPin size={14} className="text-muted" />
                  <span className="text-muted">Location:</span>
                  <span className="text-foreground">{ticket.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <Tag size={14} className="text-muted" />
                  <span className="text-muted">Category:</span>
                  <span className="text-foreground">
                    {ticket.category.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <User size={14} className="text-muted" />
                  <span className="text-muted">Reported by:</span>
                  <span className="text-foreground">{ticket.createdByName}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <Clock size={14} className="text-muted" />
                  <span className="text-muted">Created:</span>
                  <span className="text-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {ticket.attachments.length > 0 && (
              <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
                <h2 className="text-[15px] font-semibold text-foreground mb-4">
                  Attachments ({ticket.attachments.length})
                </h2>
                <div className="flex gap-4 flex-wrap">
                  {ticket.attachments.map((att) => {
                    const isImage = att.fileType?.startsWith("image/");
                    return (
                      <a
                        key={att.id}
                        href={att.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-32 h-32 rounded-lg bg-gray-100 border border-border overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all"
                      >
                        {isImage ? (
                          <img
                            src={att.filePath}
                            alt={att.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full px-2">
                            <span className="text-[20px] mb-1">📎</span>
                            <span className="text-[11px] text-muted text-center line-clamp-2">
                              {att.fileName}
                            </span>
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {(ticket.resolutionNotes || canUpdateStatus) && (
              <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
                <h2 className="text-[15px] font-semibold text-foreground mb-4">
                  Resolution Notes
                </h2>
                {ticket.resolutionNotes ? (
                  <p className="text-[14px] text-foreground">
                    {ticket.resolutionNotes}
                  </p>
                ) : canUpdateStatus && !isClosed ? (
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Add resolution notes..."
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                ) : (
                  <p className="text-[13px] text-muted italic">
                    No resolution notes yet.
                  </p>
                )}
              </div>
            )}

            {/* Comments */}
            <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-muted" />
                Comments ({comments.length})
              </h2>
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[12px] font-semibold">
                      {c.userName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground">
                          {c.userName}
                        </span>
                        <StatusBadge status={c.userRole} />
                        <span className="text-[11px] text-muted">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                        {c.isEdited && (
                          <span className="text-[11px] text-muted italic">(edited)</span>
                        )}
                      </div>
                      {editingCommentId === c.id ? (
                        <div className="mt-1 flex gap-2">
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
                            className="text-[12px] text-primary hover:underline"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            className="text-[12px] text-muted hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-[13px] text-foreground mt-1">{c.content}</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        {c.userId === user?.id && editingCommentId !== c.id && (
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
                        {(c.userId === user?.id || isAdmin) && (
                          <button
                            type="button"
                            onClick={() => setDeleteCommentTarget(c.id)}
                            className="text-[11px] text-muted hover:text-red-500 flex items-center gap-1"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!isClosed && (
                <div className="mt-5 pt-4 border-t border-border flex gap-3">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
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

          {/* Sidebar */}
          <div className="space-y-6">
            {!isClosed && (
              <div className="rounded-xl bg-card-bg border border-border shadow-sm p-5">
                <h3 className="text-[14px] font-semibold text-foreground mb-3">
                  Actions
                </h3>

                {actionError && (
                  <p className="text-[12px] text-red-500 mb-2">{actionError}</p>
                )}

                <div className="space-y-2">
                  {canManage && (
                    <div>
                      <label className="block text-[12px] font-medium text-muted mb-1">
                        Assign Technician
                      </label>
                      <select
                        value={selectedTechnician}
                        onChange={(e) => setSelectedTechnician(e.target.value)}
                        className="h-9 w-full rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary"
                      >
                        <option value="">Select technician...</option>
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      {selectedTechnician && (
                        <button
                          type="button"
                          onClick={handleAssign}
                          disabled={updating}
                          className="mt-2 w-full rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                          {updating ? "Assigning..." : "Assign"}
                        </button>
                      )}
                    </div>
                  )}
                  {canUpdateStatus && (
                    <div>
                      <label className="block text-[12px] font-medium text-muted mb-1">
                        Update Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="h-9 w-full rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary"
                      >
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleUpdateStatus}
                        disabled={updating}
                        className="mt-2 w-full rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "Update"}
                      </button>
                    </div>
                  )}
                  {canManage && (
                    <div className="pt-3 border-t border-border space-y-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={updating}
                        className="w-full rounded-lg bg-green-600 px-3 py-2 text-[12px] font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Close Ticket
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={updating}
                        className="w-full rounded-lg bg-danger px-3 py-2 text-[12px] font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        Reject Ticket
                      </button>
                      {showRejectDialog && (
                        <div className="mt-2 p-3 rounded-lg border border-red-200 bg-red-50 space-y-2">
                          <label className="block text-[12px] font-medium text-red-700">
                            Rejection Reason
                          </label>
                          <textarea
                            rows={2}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-red-400 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleReject}
                              disabled={updating || !rejectionReason.trim()}
                              className="flex-1 rounded-lg bg-danger px-3 py-1.5 text-[11px] font-medium text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              {updating ? "Rejecting..." : "Confirm Reject"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowRejectDialog(false);
                                setRejectionReason("");
                              }}
                              className="flex-1 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-card-bg border border-border shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-foreground mb-3">
                Ticket Info
              </h3>
              <div className="space-y-3 text-[13px]">
                <div>
                  <p className="text-muted">Assigned To</p>
                  <p className="text-foreground font-medium">
                    {ticket.assignedToName || "Unassigned"}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Resource</p>
                  <p className="text-foreground font-medium">
                    {ticket.resourceName || "None"}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Contact</p>
                  <p className="text-foreground">{ticket.contactEmail || "—"}</p>
                  <p className="text-foreground">{ticket.contactPhone || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConfirmModal
          open={deleteCommentTarget !== null}
          title="Delete Comment"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={confirmDeleteComment}
          onCancel={() => setDeleteCommentTarget(null)}
        />
      </div>
    </MainLayout>
  );
}
