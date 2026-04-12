"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Plus, Search, Check, X, Loader2 } from "lucide-react";

interface BookingRecord {
  id: number;
  resourceName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  userId: number;
  userName: string;
}

const STATUS_OPTIONS = ["All", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function BookingsContent() {
  const { user } = useAuth();
  const canViewAll = user?.role === "MANAGER" || user?.role === "ADMIN";
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [myBookings, setMyBookings] = useState<BookingRecord[]>([]);
  const [allBookings, setAllBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const fetchMyBookings = useCallback(async () => {
    const data = await apiFetch<BookingRecord[]>("/api/bookings/my");
    setMyBookings(data);
  }, []);

  const fetchAllBookings = useCallback(async () => {
    if (!canViewAll) return;
    const data = await apiFetch<BookingRecord[]>("/api/bookings");
    setAllBookings(data);
  }, [canViewAll]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      await Promise.all([fetchMyBookings(), fetchAllBookings()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [fetchMyBookings, fetchAllBookings]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await apiFetch(`/api/bookings/${id}/review`, {
        method: "PUT",
        body: JSON.stringify({ status: "APPROVED", reviewReason: null }),
      });
      await fetchData();
    } catch {
      setErrorModal("Failed to approve booking");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = async (reason?: string) => {
    if (!rejectTarget || !reason?.trim()) return;
    setActionLoading(rejectTarget);
    try {
      await apiFetch(`/api/bookings/${rejectTarget}/review`, {
        method: "PUT",
        body: JSON.stringify({ status: "REJECTED", reviewReason: reason.trim() }),
      });
      setRejectTarget(null);
      await fetchData();
    } catch {
      setRejectTarget(null);
      setErrorModal("Failed to reject booking");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(cancelTarget);
    try {
      await apiFetch(`/api/bookings/${cancelTarget}/cancel`, { method: "PUT" });
      setCancelTarget(null);
      await fetchData();
    } catch {
      setCancelTarget(null);
      setErrorModal("Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  const bookings = activeTab === "all" ? allBookings : myBookings;
  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    const matchesSearch =
      b.resourceName?.toLowerCase().includes(search.toLowerCase()) ||
      b.purpose?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="ml-2 text-[14px] text-muted">
          Loading bookings...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <PageHeader
          title="Bookings"
          subtitle="View and manage resource bookings"
        />
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-[14px] text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Bookings"
        subtitle="View and manage resource bookings"
        actions={
          <Link
            href="/bookings/new/"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            New Booking
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
            activeTab === "my"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          My Bookings
        </button>
        {canViewAll && (
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            All Bookings
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by resource or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card-bg pl-9 pr-4 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card-bg border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-[13px] min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-5 py-3 text-left font-medium text-muted">
                Resource
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Date
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Time
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Purpose
              </th>
              {activeTab === "all" && (
                <th className="px-5 py-3 text-left font-medium text-muted">
                  Requested By
                </th>
              )}
              <th className="px-5 py-3 text-left font-medium text-muted">
                Status
              </th>
              <th className="px-5 py-3 text-right font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={activeTab === "all" ? 7 : 6}
                  className="px-5 py-8 text-center text-muted text-[13px]"
                >
                  No bookings found.
                </td>
              </tr>
            ) : (
              filtered.map((booking) => {
                const isOwner = booking.userId === user?.id;
                const isActioning = actionLoading === booking.id;

                return (
                  <tr
                    key={booking.id}
                    className={`hover:bg-gray-50 ${isActioning ? "opacity-60" : ""}`}
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/bookings/${booking.id}/`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {booking.resourceName}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-foreground">
                      {booking.bookingDate}
                    </td>
                    <td className="px-5 py-3.5 text-foreground">
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td className="px-5 py-3.5 text-muted max-w-[200px] truncate">
                      {booking.purpose}
                    </td>
                    {activeTab === "all" && (
                      <td className="px-5 py-3.5 text-foreground">
                        {booking.userName}
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canViewAll && booking.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() => handleApprove(booking.id)}
                              className="rounded p-1.5 text-green-600 hover:bg-green-50"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() => setRejectTarget(booking.id)}
                              className="rounded p-1.5 text-red-600 hover:bg-red-50"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {isOwner &&
                          (booking.status === "PENDING" ||
                            booking.status === "APPROVED") && (
                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() => setCancelTarget(booking.id)}
                              className="rounded px-2 py-1 text-[12px] text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={cancelTarget !== null}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        confirmLabel="Cancel Booking"
        variant="danger"
        loading={actionLoading !== null}
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
      <ConfirmModal
        open={rejectTarget !== null}
        title="Reject Booking"
        message="Please provide a reason for rejecting this booking."
        confirmLabel="Reject"
        variant="danger"
        loading={actionLoading !== null}
        input={{ placeholder: "Rejection reason (required)", required: true }}
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />
      <ConfirmModal
        open={errorModal !== null}
        title="Error"
        message={errorModal || ""}
        confirmLabel="OK"
        cancelLabel={null}
        variant="danger"
        onConfirm={() => setErrorModal(null)}
        onCancel={() => setErrorModal(null)}
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <MainLayout>
      <BookingsContent />
    </MainLayout>
  );
}
