"use client";

import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { MapPin, Users, Clock, Pencil, Trash2, Power } from "lucide-react";

const mockResource = {
  id: 1,
  name: "Collaborative Lab Room 402",
  type: "LAB",
  capacity: 30,
  location: "Engineering Block B, Floor 4",
  description:
    "A fully equipped collaborative lab with workstations, projector, and whiteboard. Ideal for team projects and workshops.",
  status: "ACTIVE",
  createdBy: "Dr. Sarah Chen",
  createdAt: "2024-09-15",
  image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop",
};

const mockAvailability = [
  { day: "Monday", start: "08:00", end: "18:00" },
  { day: "Tuesday", start: "08:00", end: "18:00" },
  { day: "Wednesday", start: "08:00", end: "18:00" },
  { day: "Thursday", start: "08:00", end: "18:00" },
  { day: "Friday", start: "08:00", end: "16:00" },
];

export default function FacilityDetailClient() {
  const { user } = useAuth();
  const canEdit = user?.role === "MANAGER" || user?.role === "ADMIN";
  const canDelete = user?.role === "ADMIN";
  const canChangeStatus =
    user?.role === "TECHNICIAN" ||
    user?.role === "MANAGER" ||
    user?.role === "ADMIN";

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={mockResource.name}
          backHref="/facilities/"
          actions={
            <div className="flex items-center gap-2">
              {canChangeStatus && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-gray-50 transition-colors"
                >
                  <Power size={14} />
                  Change Status
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
          }
        />

        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden h-56">
            <img
              src={mockResource.image}
              alt={mockResource.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={mockResource.status} />
              <StatusBadge status={mockResource.type} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Location
                  </p>
                  <p className="text-[14px] text-foreground flex items-center gap-2">
                    <MapPin size={14} className="text-muted" />
                    {mockResource.location}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Capacity
                  </p>
                  <p className="text-[14px] text-foreground flex items-center gap-2">
                    <Users size={14} className="text-muted" />
                    {mockResource.capacity} people
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Created By
                  </p>
                  <p className="text-[14px] text-foreground">
                    {mockResource.createdBy}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Added On
                  </p>
                  <p className="text-[14px] text-foreground">
                    {mockResource.createdAt}
                  </p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                  Description
                </p>
                <p className="text-[14px] text-foreground leading-relaxed">
                  {mockResource.description}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
            <h2 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={16} className="text-muted" />
              Availability Windows
            </h2>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted">
                      Day
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted">
                      Start Time
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted">
                      End Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockAvailability.map((slot) => (
                    <tr key={slot.day} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {slot.day}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {slot.start}
                      </td>
                      <td className="px-4 py-3 text-foreground">{slot.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
