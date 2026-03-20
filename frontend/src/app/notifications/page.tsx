"use client";

import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  UserPlus,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCheck,
} from "lucide-react";

const NOTIFICATION_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  BOOKING_APPROVED: CheckCircle,
  BOOKING_REJECTED: XCircle,
  TICKET_STATUS_CHANGE: RefreshCw,
  TICKET_ASSIGNED: UserPlus,
  NEW_COMMENT: MessageSquare,
  NEW_BOOKING_REQUEST: Calendar,
  NEW_TICKET: AlertTriangle,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  BOOKING_APPROVED: "text-green-600 bg-green-50",
  BOOKING_REJECTED: "text-red-600 bg-red-50",
  TICKET_STATUS_CHANGE: "text-blue-600 bg-blue-50",
  TICKET_ASSIGNED: "text-purple-600 bg-purple-50",
  NEW_COMMENT: "text-indigo-600 bg-indigo-50",
  NEW_BOOKING_REQUEST: "text-yellow-600 bg-yellow-50",
  NEW_TICKET: "text-orange-600 bg-orange-50",
};

const mockNotifications = [
  {
    id: 1,
    type: "BOOKING_APPROVED",
    title: "Booking Approved",
    message:
      'Your booking for "Collaborative Lab Room 402" on Mar 24 has been approved.',
    referenceType: "BOOKING",
    referenceId: 1,
    isRead: false,
    createdAt: "2026-03-20T14:30:00Z",
  },
  {
    id: 2,
    type: "NEW_COMMENT",
    title: "New Comment",
    message:
      'John Doe commented on ticket #TK-8821: "The replacement part should arrive by Wednesday."',
    referenceType: "TICKET",
    referenceId: 1,
    isRead: false,
    createdAt: "2026-03-19T16:00:00Z",
  },
  {
    id: 3,
    type: "TICKET_STATUS_CHANGE",
    title: "Ticket Updated",
    message: 'Ticket #TK-8821 "Broken Chair" status changed to In Progress.',
    referenceType: "TICKET",
    referenceId: 1,
    isRead: true,
    createdAt: "2026-03-19T10:15:00Z",
  },
  {
    id: 4,
    type: "BOOKING_REJECTED",
    title: "Booking Rejected",
    message:
      'Your booking for "Main Lecture Hall A" on Mar 20 was rejected. Reason: Schedule conflict with exam.',
    referenceType: "BOOKING",
    referenceId: 3,
    isRead: true,
    createdAt: "2026-03-18T09:00:00Z",
  },
  {
    id: 5,
    type: "NEW_BOOKING_REQUEST",
    title: "New Booking Request",
    message:
      'Lisa Wang requested "Private Study Pods" for Mar 27, 08:00-10:00.',
    referenceType: "BOOKING",
    referenceId: 6,
    isRead: true,
    createdAt: "2026-03-17T11:20:00Z",
  },
  {
    id: 6,
    type: "NEW_TICKET",
    title: "New Incident Reported",
    message:
      'A new incident "Projector Not Working" has been reported at Lecture Hall A.',
    referenceType: "TICKET",
    referenceId: 4,
    isRead: true,
    createdAt: "2026-03-16T15:45:00Z",
  },
];

function getLink(referenceType: string, referenceId: number) {
  if (referenceType === "BOOKING") return `/bookings/${referenceId}/`;
  if (referenceType === "TICKET") return `/incidents/${referenceId}/`;
  return "#";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationsContent() {
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-gray-50 transition-colors"
          >
            <CheckCheck size={16} />
            Mark All as Read
          </button>
        }
      />

      <div className="rounded-xl bg-card-bg border border-border shadow-sm overflow-hidden divide-y divide-border">
        {mockNotifications.map((notification) => {
          const Icon =
            NOTIFICATION_ICONS[notification.type] || AlertTriangle;
          const colorClass =
            NOTIFICATION_COLORS[notification.type] ||
            "text-gray-600 bg-gray-50";

          return (
            <Link
              key={notification.id}
              href={getLink(
                notification.referenceType,
                notification.referenceId,
              )}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? "bg-blue-50/40" : ""
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}
              >
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-[13px] font-semibold ${!notification.isRead ? "text-foreground" : "text-muted"}`}
                  >
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-[13px] text-muted mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
              </div>
              <span className="text-[11px] text-muted whitespace-nowrap shrink-0">
                {timeAgo(notification.createdAt)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <MainLayout>
      <NotificationsContent />
    </MainLayout>
  );
}
