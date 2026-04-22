"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import MainLayout from "@/components/layout/MainLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  CalendarPlus,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Ticket,
  Loader2,
  Building2,
  BarChart3,
  Star,
} from "lucide-react";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface BookingItem {
  id: number;
  resourceName: string;
  resourceLocation: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface TicketItem {
  id: number;
  code: string;
  title: string;
  location: string;
  status: string;
  createdAt: string;
}

interface ResourceItem {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  type: string;
}

interface ResourceListResponse {
  resources: ResourceItem[];
}

interface PeakResource {
  id: number;
  name: string;
  type: string;
  location: string;
  status: string;
  bookingCount: number;
  sharePercent: number;
}

interface TechnicianRating {
  technicianId: number;
  technicianName: string;
  avgStars: number;
  ratingCount: number;
}

function DashboardContent() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "User";
  const isManagerOrAdmin = user?.role === "MANAGER" || user?.role === "ADMIN";

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [peakResources, setPeakResources] = useState<PeakResource[]>([]);
  const [techRatings, setTechRatings] = useState<TechnicianRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [bookingData, ticketData, resourceData, peakData, ratingData] =
          await Promise.all([
            apiFetch<BookingItem[]>("/api/bookings/my").catch(() => []),
            apiFetch<TicketItem[]>("/api/tickets/my").catch(() => []),
            apiFetch<ResourceListResponse>(
              "/api/resources?page=0&size=4",
            ).catch(() => ({ resources: [] })),
            isManagerOrAdmin
              ? apiFetch<PeakResource[]>(
                  "/api/analytics/peak-resources?days=30&limit=5",
                ).catch(() => [])
              : Promise.resolve([] as PeakResource[]),
            isManagerOrAdmin
              ? apiFetch<TechnicianRating[]>(
                  "/api/ratings/technicians?limit=5",
                ).catch(() => [])
              : Promise.resolve([] as TechnicianRating[]),
          ]);
        setBookings(
          (bookingData || [])
            .filter((b) => b.status === "APPROVED" || b.status === "PENDING")
            .slice(0, 3),
        );
        setTickets(
          (ticketData || [])
            .filter(
              (t) =>
                t.status === "OPEN" ||
                t.status === "IN_PROGRESS",
            )
            .slice(0, 3),
        );
        setResources(resourceData?.resources?.slice(0, 4) || []);
        setPeakResources(
          (peakData || []).filter((r) => r.bookingCount > 0),
        );
        setTechRatings(ratingData || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isManagerOrAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="ml-2 text-[14px] text-muted">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName}!
          </h1>
          <p className="text-[14px] text-muted mt-0.5">
            Your campus overview for {formatDate()}.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/bookings/new/"
            className="flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2.5 text-[13px] font-semibold text-primary hover:bg-blue-50 transition-colors"
          >
            <CalendarPlus size={16} />
            Book a Resource
          </Link>
          <Link
            href="/incidents/new/"
            className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
          >
            <AlertTriangle size={16} />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Bookings */}
        <div className="lg:col-span-2 rounded-xl bg-card-bg border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-muted" />
              <h2 className="text-[15px] font-semibold text-foreground">
                My Bookings
              </h2>
            </div>
            <Link
              href="/bookings/"
              className="text-[13px] font-medium text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {bookings.length === 0 ? (
              <div className="px-6 py-8 text-center text-[13px] text-muted">
                No upcoming bookings.
              </div>
            ) : (
              bookings.map((booking) => {
                const date = new Date(booking.bookingDate);
                return (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}/`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-blue-50 text-primary">
                      <span className="text-[10px] font-bold uppercase leading-none">
                        {date.toLocaleString("en-US", { month: "short" })}
                      </span>
                      <span className="text-xl font-bold leading-tight">
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground truncate">
                        {booking.resourceName}
                      </p>
                      <p className="text-[12px] text-muted mt-0.5">
                        {booking.startTime} - {booking.endTime} &bull;{" "}
                        {booking.resourceLocation}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Active Tickets */}
        <div className="rounded-xl bg-card-bg border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Ticket size={18} className="text-muted" />
              <h2 className="text-[15px] font-semibold text-foreground">
                Active Tickets
              </h2>
            </div>
            <Link
              href="/incidents/"
              className="text-[13px] font-medium text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {tickets.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-muted">
                No active tickets.
              </div>
            ) : (
              tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/incidents/${ticket.id}/`}
                  className="block px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">
                        <span className="text-muted font-medium">
                          #{ticket.code}
                        </span>{" "}
                        {ticket.title}
                      </p>
                      <p className="text-[11.5px] text-muted mt-0.5">
                        {ticket.location}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Peak Usage Analytics (MANAGER / ADMIN only) */}
      {isManagerOrAdmin && peakResources.length > 0 && (
        <div className="rounded-xl bg-card-bg border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-muted" />
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  Peak Booked Facilities (Last 30 Days)
                </h2>
                <p className="text-[12px] text-muted mt-0.5">
                  Top {peakResources.length} by approved bookings
                </p>
              </div>
            </div>
            <Link
              href="/facilities/"
              className="text-[13px] font-medium text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {peakResources.map((r, idx) => (
              <li
                key={r.id}
                className="flex items-center gap-4 px-6 py-3.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[12px] font-bold text-primary">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/facilities/${r.id}/`}
                      className="text-[14px] font-semibold text-foreground hover:text-primary truncate"
                    >
                      {r.name}
                    </Link>
                    <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">
                      {r.bookingCount}{" "}
                      <span className="font-normal text-muted">
                        {r.bookingCount === 1 ? "booking" : "bookings"}
                      </span>
                    </span>
                  </div>
                  <p className="text-[11.5px] text-muted mt-0.5 truncate">
                    {r.type.replace(/_/g, " ")} &bull; {r.location}
                  </p>
                  <div
                    className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(r.sharePercent)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.max(r.sharePercent, 4)}%`,
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technician Satisfaction (MANAGER / ADMIN only) */}
      {isManagerOrAdmin && techRatings.length > 0 && (
        <div className="rounded-xl bg-card-bg border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-500 fill-amber-500" />
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  Technician Satisfaction
                </h2>
                <p className="text-[12px] text-muted mt-0.5">
                  Top {techRatings.length} by average ticket rating
                </p>
              </div>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {techRatings.map((t, idx) => {
              const fillPct = (t.avgStars / 5) * 100;
              return (
                <li
                  key={t.technicianId}
                  className="flex items-center gap-4 px-6 py-3.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[12px] font-bold text-amber-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-semibold text-foreground truncate">
                        {t.technicianName}
                      </p>
                      <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">
                        {t.avgStars.toFixed(2)}
                        <span className="text-muted font-normal">/5</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="relative inline-flex"
                        aria-label={`${t.avgStars.toFixed(2)} of 5 stars`}
                      >
                        <span className="inline-flex items-center gap-0.5 text-gray-300">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} size={14} className="fill-current" />
                          ))}
                        </span>
                        <span
                          className="absolute inset-0 inline-flex items-center gap-0.5 text-amber-400 overflow-hidden"
                          style={{ width: `${fillPct}%` }}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              size={14}
                              className="fill-current shrink-0"
                            />
                          ))}
                        </span>
                      </div>
                      <span className="text-[11.5px] text-muted">
                        ({t.ratingCount} rating
                        {t.ratingCount === 1 ? "" : "s"})
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Resource Catalogue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-muted" />
            <h2 className="text-lg font-bold text-foreground">
              Resource Catalogue
            </h2>
          </div>
          <Link
            href="/facilities/"
            className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
          >
            Explore All
            <ArrowRight size={14} />
          </Link>
        </div>
        {resources.length === 0 ? (
          <div className="rounded-xl bg-card-bg border border-border p-8 text-center text-[13px] text-muted">
            No resources available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {resources.map((resource) => (
              <Link
                key={resource.id}
                href={`/facilities/${resource.id}/`}
                className="group rounded-xl bg-card-bg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {resource.imageUrl ? (
                    <img
                      src={resource.imageUrl}
                      alt={resource.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-muted text-[12px]">
                      {resource.type.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[14px] font-semibold text-foreground">
                    {resource.name}
                  </p>
                  <p className="text-[12px] text-muted mt-0.5 line-clamp-1">
                    {resource.description || resource.type.replace(/_/g, " ")}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={resource.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <MainLayout>
      <DashboardContent />
    </MainLayout>
  );
}
