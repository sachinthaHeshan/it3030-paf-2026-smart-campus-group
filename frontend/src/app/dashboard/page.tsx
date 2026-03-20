"use client";

import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  CalendarPlus,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Bookmark,
  Ticket,
} from "lucide-react";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface BookingCard {
  id: string;
  month: string;
  day: number;
  title: string;
  time: string;
  location: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
}

const mockBookings: BookingCard[] = [
  {
    id: "1",
    month: "MAR",
    day: 24,
    title: "Collaborative Lab Room 402",
    time: "14:00 - 16:30",
    location: "Engineering Block B",
    status: "APPROVED",
  },
  {
    id: "2",
    month: "MAR",
    day: 28,
    title: "Advanced VR Headset (Meta Quest 3)",
    time: "09:00 - 12:00",
    location: "Media Innovation Hub",
    status: "PENDING",
  },
];

interface TicketCard {
  id: string;
  code: string;
  title: string;
  time: string;
  location: string;
  status: "In Progress" | "Pending" | "Resolved";
}

const mockTickets: TicketCard[] = [
  {
    id: "1",
    code: "TK-8821",
    title: "Broken Chair",
    time: "Reported 2 days ago",
    location: "Study Hall 2",
    status: "In Progress",
  },
  {
    id: "2",
    code: "TK-8904",
    title: "Wi-Fi Latency",
    time: "Reported 4 hours ago",
    location: "Dorm A",
    status: "Pending",
  },
];

interface ResourceCard {
  id: string;
  title: string;
  description: string;
  image: string;
  status: "AVAILABLE NOW" | "IN USE" | "MAINTENANCE";
}

const mockResources: ResourceCard[] = [
  {
    id: "1",
    title: "Private Study Pods",
    description: "Quiet zone, 1-2 people capacity",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
    status: "AVAILABLE NOW",
  },
  {
    id: "2",
    title: "Electronics Toolkit",
    description: "Oscilloscopes, soldering stations",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=250&fit=crop",
    status: "IN USE",
  },
  {
    id: "3",
    title: "Makerspace 3D Lab",
    description: "SLA and FDM printing services",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
    status: "AVAILABLE NOW",
  },
  {
    id: "4",
    title: "Boardroom Beta",
    description: "Up to 12 people, VC Integrated",
    image: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&h=250&fit=crop",
    status: "MAINTENANCE",
  },
];

function DashboardContent() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName}!
          </h1>
          <p className="text-[14px] text-muted mt-0.5">
            Your campus overview for {formatDate()}.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2.5 text-[13px] font-semibold text-primary hover:bg-blue-50 transition-colors"
          >
            <CalendarPlus size={16} />
            Book a Resource
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
          >
            <AlertTriangle size={16} />
            Report Incident
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* My Bookings - spans 2 cols */}
        <div className="col-span-2 rounded-xl bg-card-bg border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-muted" />
              <h2 className="text-[15px] font-semibold text-foreground">
                My Bookings
              </h2>
            </div>
            <button
              type="button"
              className="text-[13px] font-medium text-primary hover:underline"
            >
              View Calendar
            </button>
          </div>
          <div className="divide-y divide-border">
            {mockBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-blue-50 text-primary">
                  <span className="text-[10px] font-bold uppercase leading-none">
                    {booking.month}
                  </span>
                  <span className="text-xl font-bold leading-tight">
                    {booking.day}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">
                    {booking.title}
                  </p>
                  <p className="text-[12px] text-muted mt-0.5">
                    {booking.time} &bull; {booking.location}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Campus Pulse */}
          <div className="rounded-xl bg-sidebar-bg p-5 text-white shadow-sm">
            <h2 className="text-[15px] font-semibold mb-4">Campus Pulse</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] text-gray-300">
                    Library Occupancy
                  </span>
                  <span className="text-[13px] font-semibold text-primary">
                    64% Low
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: "64%" }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-300">
                  Energy Efficiency
                </span>
                <span className="text-[13px] font-semibold text-success">
                  Optimal
                </span>
              </div>
            </div>
          </div>

          {/* Active Tickets */}
          <div className="rounded-xl bg-card-bg border border-border shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Ticket size={18} className="text-muted" />
              <h2 className="text-[15px] font-semibold text-foreground">
                Active Tickets
              </h2>
            </div>
            <div className="divide-y divide-border">
              {mockTickets.map((ticket) => (
                <div key={ticket.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">
                        <span className="text-muted font-medium">
                          #{ticket.code}
                        </span>{" "}
                        {ticket.title}
                      </p>
                      <p className="text-[11.5px] text-muted mt-0.5">
                        {ticket.time} &bull; {ticket.location}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Catalogue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            Resource Catalogue
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
          >
            Explore All
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {mockResources.map((resource) => (
            <div
              key={resource.id}
              className="group rounded-xl bg-card-bg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <p className="text-[14px] font-semibold text-foreground">
                  {resource.title}
                </p>
                <p className="text-[12px] text-muted mt-0.5">
                  {resource.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={resource.status} />
                  <button type="button" className="text-muted hover:text-primary transition-colors">
                    <Bookmark size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
