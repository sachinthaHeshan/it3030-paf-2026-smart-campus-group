"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/components/RoleGuard";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { apiFetch } from "@/lib/api";
import {
  History,
  Loader2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
  Wrench,
  Lock,
  MessageSquare,
  Pencil,
  Building2,
  UserPlus,
  Activity,
} from "lucide-react";

interface ActivityEntry {
  action: string;
  actorId: number;
  actorName: string;
  actorRole: string;
  targetType: string;
  targetId: number | null;
  targetLabel: string | null;
  summary: string;
  occurredAt: string;
}

interface ActivityActor {
  id: number;
  name: string;
  role: string;
}

interface ActivityPage {
  items: ActivityEntry[];
  total: number;
  page: number;
  size: number;
}

const PAGE_SIZE = 25;

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "BOOKING_CREATED", label: "Booking created" },
  { value: "BOOKING_APPROVED", label: "Booking approved" },
  { value: "BOOKING_REJECTED", label: "Booking rejected" },
  { value: "BOOKING_CANCELLED", label: "Booking cancelled" },
  { value: "TICKET_CREATED", label: "Ticket created" },
  { value: "TICKET_RESOLVED", label: "Ticket resolved" },
  { value: "TICKET_CLOSED", label: "Ticket closed" },
  { value: "COMMENT_POSTED", label: "Comment posted" },
  { value: "COMMENT_EDITED", label: "Comment edited" },
  { value: "RESOURCE_CREATED", label: "Resource created" },
  { value: "USER_JOINED", label: "User joined" },
];

const TARGET_OPTIONS: { value: string; label: string }[] = [
  { value: "BOOKING", label: "Bookings" },
  { value: "TICKET", label: "Tickets" },
  { value: "COMMENT", label: "Comments" },
  { value: "RESOURCE", label: "Resources" },
  { value: "USER", label: "Users" },
];

function timeAgo(dateStr: string) {
  if (!dateStr) return "";
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

function actionIcon(action: string) {
  switch (action) {
    case "BOOKING_CREATED":
      return <CalendarPlus size={14} />;
    case "BOOKING_APPROVED":
      return <CheckCircle size={14} />;
    case "BOOKING_REJECTED":
      return <XCircle size={14} />;
    case "BOOKING_CANCELLED":
      return <Ban size={14} />;
    case "TICKET_CREATED":
      return <AlertTriangle size={14} />;
    case "TICKET_RESOLVED":
      return <Wrench size={14} />;
    case "TICKET_CLOSED":
      return <Lock size={14} />;
    case "COMMENT_POSTED":
      return <MessageSquare size={14} />;
    case "COMMENT_EDITED":
      return <Pencil size={14} />;
    case "RESOURCE_CREATED":
      return <Building2 size={14} />;
    case "USER_JOINED":
      return <UserPlus size={14} />;
    default:
      return <Activity size={14} />;
  }
}

function actionTone(action: string): string {
  if (action.endsWith("APPROVED") || action.endsWith("RESOLVED"))
    return "bg-green-100 text-green-700";
  if (action.endsWith("REJECTED") || action.endsWith("CANCELLED"))
    return "bg-red-100 text-red-700";
  if (action.startsWith("TICKET_") || action === "RESOURCE_CREATED")
    return "bg-amber-100 text-amber-700";
  if (action === "USER_JOINED") return "bg-purple-100 text-purple-700";
  return "bg-blue-100 text-blue-700";
}

function targetHref(entry: ActivityEntry): string | null {
  if (!entry.targetId) return null;
  switch (entry.targetType) {
    case "BOOKING":
      return `/bookings/${entry.targetId}/`;
    case "TICKET":
    case "COMMENT":
      return entry.targetType === "COMMENT"
        ? null
        : `/incidents/${entry.targetId}/`;
    case "RESOURCE":
      return `/facilities/${entry.targetId}/`;
    case "USER":
      return `/user-management/`;
    default:
      return null;
  }
}

function ActivityLogContent() {
  const [data, setData] = useState<ActivityPage | null>(null);
  const [actors, setActors] = useState<ActivityActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actorId, setActorId] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [targetType, setTargetType] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(0);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(PAGE_SIZE));
    if (actorId) params.set("actorId", actorId);
    if (action) params.set("action", action);
    if (targetType) params.set("targetType", targetType);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params.toString();
  }, [page, actorId, action, targetType, from, to]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<ActivityPage>(
        `/api/admin/activity-log?${queryString}`,
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    apiFetch<ActivityActor[]>("/api/admin/activity-log/actors")
      .then(setActors)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(0);
  }, [actorId, action, targetType, from, to]);

  const clearFilters = () => {
    setActorId("");
    setAction("");
    setTargetType("");
    setFrom("");
    setTo("");
  };

  const hasFilters = actorId || action || targetType || from || to;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Activity Log"
        subtitle="Recent actions performed by users across the platform"
        actions={
          data && (
            <span className="text-[12px] text-muted">
              {data.total.toLocaleString()} total event
              {data.total === 1 ? "" : "s"}
            </span>
          )
        }
      />

      {/* Filter bar */}
      <div className="rounded-xl bg-card-bg border border-border shadow-sm p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-muted" />
          <p className="text-[12px] font-medium text-muted uppercase tracking-wide">
            Filters
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-[12px] text-primary hover:underline"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-muted mb-1">
              Actor
            </label>
            <select
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary"
            >
              <option value="">All users</option>
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted mb-1">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary"
            >
              <option value="">All actions</option>
              {ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted mb-1">
              Target
            </label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary"
            >
              <option value="">All types</option>
              {TARGET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted mb-1">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted mb-1">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-white px-2 text-[13px] outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl bg-card-bg border border-border shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className="ml-2 text-[13px] text-muted">
              Loading activity...
            </span>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-[13px] text-red-600">
            {error}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <History size={36} className="opacity-30 mb-2" />
            <p className="text-[13px]">No activity matches these filters.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((entry, idx) => {
              const href = targetHref(entry);
              return (
                <li
                  key={`${entry.action}-${entry.targetType}-${entry.targetId ?? "x"}-${entry.occurredAt}-${idx}`}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${actionTone(entry.action)}`}
                  >
                    {actionIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] text-foreground leading-snug">
                      <span className="font-semibold">{entry.actorName}</span>{" "}
                      <span className="ml-1 inline-flex align-middle">
                        <StatusBadge status={entry.actorRole} />
                      </span>{" "}
                      <span className="text-muted">
                        {entry.summary?.replace(entry.targetLabel ?? "", "").trim() ||
                          entry.action.toLowerCase().replace(/_/g, " ")}
                      </span>{" "}
                      {entry.targetLabel &&
                        (href ? (
                          <Link
                            href={href}
                            className="font-medium text-primary hover:underline"
                          >
                            {entry.targetLabel}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">
                            {entry.targetLabel}
                          </span>
                        ))}
                    </p>
                    <p className="text-[11.5px] text-muted mt-1">
                      {timeAgo(entry.occurredAt)}
                      {" \u00B7 "}
                      {new Date(entry.occurredAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Pagination */}
        {data && data.total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-[12px] text-muted">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page + 1 >= totalPages || loading}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityLogPage() {
  return (
    <MainLayout>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <ActivityLogContent />
      </RoleGuard>
    </MainLayout>
  );
}
