"use client";

import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { Calendar, Clock, MapPin, Users, FileText, User } from "lucide-react";

const mockBooking = {
  id: 1,
  resourceName: "Collaborative Lab Room 402",
  resourceType: "LAB",
  location: "Engineering Block B, Floor 4",
  date: "2026-03-24",
  startTime: "14:00",
  endTime: "16:30",
  purpose:
    "Group project work session for the software engineering module. Will need whiteboard and projector access.",
  expectedAttendees: 8,
  status: "PENDING",
  requestedBy: {
    name: "Alex Rivera",
    email: "alex.rivera@university.edu",
    role: "USER",
  },
  createdAt: "2026-03-20T10:30:00Z",
  reviewedBy: null,
  reviewReason: null,
};

export default function BookingDetailClient() {
  const { user } = useAuth();
  const canReview = user?.role === "MANAGER" || user?.role === "ADMIN";
  const isOwner = true;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={`Booking #${mockBooking.id}`}
          backHref="/bookings/"
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={mockBooking.status} />
            </div>
          }
        />

        <div className="space-y-6">
          <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
            <h2 className="text-[15px] font-semibold text-foreground mb-4">
              Booking Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Resource
                  </p>
                  <p className="text-[14px] font-medium text-foreground">
                    {mockBooking.resourceName}
                  </p>
                  <span className="mt-1 inline-block">
                    <StatusBadge status={mockBooking.resourceType} />
                  </span>
                </div>
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Location
                  </p>
                  <p className="text-[14px] text-foreground flex items-center gap-2">
                    <MapPin size={14} className="text-muted" />
                    {mockBooking.location}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Date
                  </p>
                  <p className="text-[14px] text-foreground flex items-center gap-2">
                    <Calendar size={14} className="text-muted" />
                    {mockBooking.date}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Time
                  </p>
                  <p className="text-[14px] text-foreground flex items-center gap-2">
                    <Clock size={14} className="text-muted" />
                    {mockBooking.startTime} - {mockBooking.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Expected Attendees
                  </p>
                  <p className="text-[14px] text-foreground flex items-center gap-2">
                    <Users size={14} className="text-muted" />
                    {mockBooking.expectedAttendees} people
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Requested By
                  </p>
                  <p className="text-[14px] text-foreground flex items-center gap-2">
                    <User size={14} className="text-muted" />
                    {mockBooking.requestedBy.name}
                  </p>
                  <p className="text-[12px] text-muted ml-[22px]">
                    {mockBooking.requestedBy.email}
                  </p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                  Purpose
                </p>
                <p className="text-[14px] text-foreground flex items-start gap-2">
                  <FileText
                    size={14}
                    className="text-muted mt-0.5 shrink-0"
                  />
                  {mockBooking.purpose}
                </p>
              </div>
            </div>
          </div>

          {canReview && mockBooking.status === "PENDING" && (
            <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-foreground mb-4">
                Review Booking
              </h2>
              <div className="mb-4">
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Reason (required for rejection)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide a reason..."
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-danger px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {isOwner &&
            (mockBooking.status === "PENDING" ||
              mockBooking.status === "APPROVED") && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-lg border border-red-200 px-5 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
}
