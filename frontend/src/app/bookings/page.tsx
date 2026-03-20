"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { Plus, Search, Check, X } from "lucide-react";

const mockMyBookings = [
  {
    id: 1,
    resourceName: "Collaborative Lab Room 402",
    date: "2026-03-24",
    startTime: "14:00",
    endTime: "16:30",
    purpose: "Group project work session",
    status: "APPROVED",
    requestedBy: "You",
  },
  {
    id: 2,
    resourceName: "Advanced VR Headset (Meta Quest 3)",
    date: "2026-03-28",
    startTime: "09:00",
    endTime: "12:00",
    purpose: "VR development testing",
    status: "PENDING",
    requestedBy: "You",
  },
  {
    id: 3,
    resourceName: "Main Lecture Hall A",
    date: "2026-03-20",
    startTime: "10:00",
    endTime: "12:00",
    purpose: "Guest lecture event",
    status: "REJECTED",
    requestedBy: "You",
  },
];

const mockAllBookings = [
  ...mockMyBookings,
  {
    id: 4,
    resourceName: "Boardroom Beta",
    date: "2026-03-25",
    startTime: "13:00",
    endTime: "14:30",
    purpose: "Department meeting",
    status: "PENDING",
    requestedBy: "Dr. Sarah Chen",
  },
  {
    id: 5,
    resourceName: "Makerspace 3D Lab",
    date: "2026-03-26",
    startTime: "15:00",
    endTime: "17:00",
    purpose: "3D printing workshop",
    status: "APPROVED",
    requestedBy: "Mike Johnson",
  },
  {
    id: 6,
    resourceName: "Private Study Pods",
    date: "2026-03-27",
    startTime: "08:00",
    endTime: "10:00",
    purpose: "Exam preparation",
    status: "PENDING",
    requestedBy: "Lisa Wang",
  },
];

const STATUS_OPTIONS = ["All", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function BookingsContent() {
  const { user } = useAuth();
  const canViewAll = user?.role === "MANAGER" || user?.role === "ADMIN";
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const bookings = activeTab === "all" ? mockAllBookings : mockMyBookings;
  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    const matchesSearch =
      b.resourceName.toLowerCase().includes(search.toLowerCase()) ||
      b.purpose.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
      <div className="flex items-center gap-3 mb-5">
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
        {activeTab === "all" && (
          <>
            <input
              type="date"
              className="h-10 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder="User..."
              className="h-10 w-36 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
            />
          </>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card-bg border border-border shadow-sm overflow-hidden">
        <table className="w-full text-[13px]">
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
            {filtered.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5">
                  <Link
                    href={`/bookings/${booking.id}/`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {booking.resourceName}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-foreground">{booking.date}</td>
                <td className="px-5 py-3.5 text-foreground">
                  {booking.startTime} - {booking.endTime}
                </td>
                <td className="px-5 py-3.5 text-muted max-w-[200px] truncate">
                  {booking.purpose}
                </td>
                {activeTab === "all" && (
                  <td className="px-5 py-3.5 text-foreground">
                    {booking.requestedBy}
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
                          className="rounded p-1.5 text-green-600 hover:bg-green-50"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {booking.requestedBy === "You" &&
                      (booking.status === "PENDING" ||
                        booking.status === "APPROVED") && (
                        <button
                          type="button"
                          className="rounded px-2 py-1 text-[12px] text-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
