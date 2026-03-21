"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  MapPin,
  Tag,
  User,
  Clock,
  MessageSquare,
  Pencil,
  Trash2,
  Send,
} from "lucide-react";

const mockTicket = {
  id: 1,
  code: "TK-8821",
  title: "Broken Chair",
  description:
    "The swivel chair at workstation 5 has a broken wheel and tilts dangerously. It needs to be replaced or repaired urgently to prevent injury.",
  category: "FURNITURE",
  priority: "MEDIUM",
  status: "IN_PROGRESS",
  location: "Study Hall 2, Workstation 5",
  resourceName: "Study Hall 2",
  contactEmail: "alex.rivera@university.edu",
  contactPhone: "+94 77 123 4567",
  createdBy: { name: "Alex Rivera", avatar: null },
  assignedTo: { name: "John Doe", avatar: null },
  createdAt: "2026-03-18T09:15:00Z",
  resolutionNotes: null,
  attachments: [
    { id: 1, fileName: "broken-chair-1.jpg" },
    { id: 2, fileName: "broken-chair-2.jpg" },
  ],
};

const mockComments = [
  {
    id: 1,
    userId: 2,
    userName: "John Doe",
    userRole: "TECHNICIAN",
    content:
      "I've inspected the chair. The wheel mechanism is completely broken. I'll order a replacement part.",
    createdAt: "2026-03-19T14:30:00Z",
    isEdited: false,
  },
  {
    id: 2,
    userId: 1,
    userName: "Alex Rivera",
    userRole: "USER",
    content: "Thank you! Is there an estimated time for the repair?",
    createdAt: "2026-03-19T15:10:00Z",
    isEdited: false,
  },
  {
    id: 3,
    userId: 2,
    userName: "John Doe",
    userRole: "TECHNICIAN",
    content:
      "The replacement part should arrive by Wednesday. I'll have it fixed by Thursday.",
    createdAt: "2026-03-19T16:00:00Z",
    isEdited: true,
  },
];

const TECHNICIANS = [
  { id: 10, name: "John Doe" },
  { id: 11, name: "Jane Smith" },
  { id: 12, name: "Robert Lee" },
];

export default function IncidentDetailClient() {
  const { user } = useAuth();
  const canManage = user?.role === "MANAGER" || user?.role === "ADMIN";
  const canUpdateStatus =
    user?.role === "TECHNICIAN" ||
    user?.role === "MANAGER" ||
    user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";
  const [comment, setComment] = useState("");

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={`#${mockTicket.code} ${mockTicket.title}`}
          backHref="/incidents/"
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={mockTicket.priority} />
              <StatusBadge status={mockTicket.status} />
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
                {mockTicket.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-[13px]">
                  <MapPin size={14} className="text-muted" />
                  <span className="text-muted">Location:</span>
                  <span className="text-foreground">{mockTicket.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <Tag size={14} className="text-muted" />
                  <span className="text-muted">Category:</span>
                  <span className="text-foreground">
                    {mockTicket.category.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <User size={14} className="text-muted" />
                  <span className="text-muted">Reported by:</span>
                  <span className="text-foreground">
                    {mockTicket.createdBy.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <Clock size={14} className="text-muted" />
                  <span className="text-muted">Created:</span>
                  <span className="text-foreground">
                    {new Date(mockTicket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {mockTicket.attachments.length > 0 && (
              <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
                <h2 className="text-[15px] font-semibold text-foreground mb-4">
                  Attachments ({mockTicket.attachments.length})
                </h2>
                <div className="flex gap-4">
                  {mockTicket.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="w-32 h-32 rounded-lg bg-gray-100 border border-border flex items-center justify-center"
                    >
                      <span className="text-[11px] text-muted text-center px-2">
                        {att.fileName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(mockTicket.resolutionNotes || canUpdateStatus) && (
              <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
                <h2 className="text-[15px] font-semibold text-foreground mb-4">
                  Resolution Notes
                </h2>
                {mockTicket.resolutionNotes ? (
                  <p className="text-[14px] text-foreground">
                    {mockTicket.resolutionNotes}
                  </p>
                ) : canUpdateStatus ? (
                  <textarea
                    rows={3}
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
                Comments ({mockComments.length})
              </h2>
              <div className="space-y-4">
                {mockComments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[12px] font-semibold">
                      {c.userName.charAt(0)}
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
                          <span className="text-[11px] text-muted italic">
                            (edited)
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-foreground mt-1">
                        {c.content}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {(c.userId === 1 || isAdmin) && (
                          <>
                            {c.userId === 1 && (
                              <button
                                type="button"
                                className="text-[11px] text-muted hover:text-primary flex items-center gap-1"
                              >
                                <Pencil size={11} /> Edit
                              </button>
                            )}
                            <button
                              type="button"
                              className="text-[11px] text-muted hover:text-red-500 flex items-center gap-1"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border flex gap-3">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 h-10 rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dark transition-colors"
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl bg-card-bg border border-border shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-foreground mb-3">
                Actions
              </h3>
              <div className="space-y-2">
                {canManage && (
                  <div>
                    <label className="block text-[12px] font-medium text-muted mb-1">
                      Assign Technician
                    </label>
                    <select className="h-9 w-full rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary">
                      <option value="">Select technician...</option>
                      {TECHNICIANS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {canUpdateStatus && (
                  <div>
                    <label className="block text-[12px] font-medium text-muted mb-1">
                      Update Status
                    </label>
                    <select className="h-9 w-full rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary">
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-white hover:bg-primary-dark transition-colors"
                    >
                      Update
                    </button>
                  </div>
                )}
                {canManage && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <button
                      type="button"
                      className="w-full rounded-lg bg-green-600 px-3 py-2 text-[12px] font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      Close Ticket
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg bg-danger px-3 py-2 text-[12px] font-medium text-white hover:bg-red-600 transition-colors"
                    >
                      Reject Ticket
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-card-bg border border-border shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-foreground mb-3">
                Ticket Info
              </h3>
              <div className="space-y-3 text-[13px]">
                <div>
                  <p className="text-muted">Assigned To</p>
                  <p className="text-foreground font-medium">
                    {mockTicket.assignedTo?.name || "Unassigned"}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Resource</p>
                  <p className="text-foreground font-medium">
                    {mockTicket.resourceName}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Contact</p>
                  <p className="text-foreground">{mockTicket.contactEmail}</p>
                  <p className="text-foreground">{mockTicket.contactPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
