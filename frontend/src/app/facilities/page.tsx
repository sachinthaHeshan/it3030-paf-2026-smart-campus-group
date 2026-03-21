"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Plus,
  Search,
  MapPin,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

const RESOURCE_TYPES = [
  "All Types",
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
  "OTHER_EQUIPMENT",
];

const mockResources = [
  {
    id: 1,
    name: "Collaborative Lab Room 402",
    type: "LAB",
    capacity: 30,
    location: "Engineering Block B",
    status: "ACTIVE",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    name: "Main Lecture Hall A",
    type: "LECTURE_HALL",
    capacity: 200,
    location: "Arts Building, Floor 1",
    status: "ACTIVE",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    name: "Boardroom Beta",
    type: "MEETING_ROOM",
    capacity: 12,
    location: "Admin Block, Floor 3",
    status: "OUT_OF_SERVICE",
    image: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&h=250&fit=crop",
  },
  {
    id: 4,
    name: "Portable Projector #5",
    type: "PROJECTOR",
    capacity: null,
    location: "IT Equipment Room",
    status: "ACTIVE",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
  },
  {
    id: 5,
    name: "Makerspace 3D Lab",
    type: "LAB",
    capacity: 15,
    location: "Innovation Hub",
    status: "ACTIVE",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=250&fit=crop",
  },
  {
    id: 6,
    name: "Private Study Pods",
    type: "MEETING_ROOM",
    capacity: 2,
    location: "Library, Floor 2",
    status: "ACTIVE",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
  },
];

function FacilitiesContent() {
  const { user } = useAuth();
  const canManage = user?.role === "MANAGER" || user?.role === "ADMIN";
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = mockResources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All Types" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Facilities & Assets"
        subtitle="Browse and manage campus resources"
        actions={
          canManage ? (
            <Link
              href="/facilities/new/"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              <Plus size={16} />
              Add Resource
            </Link>
          ) : undefined
        }
      />

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card-bg pl-9 pr-4 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "All Types" ? t : t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Location..."
          className="h-10 w-full sm:w-44 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
        />
        <input
          type="number"
          placeholder="Min capacity"
          className="h-10 w-full sm:w-32 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
        />
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((resource) => (
          <div
            key={resource.id}
            className="group relative rounded-xl bg-card-bg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <Link href={`/facilities/${resource.id}/`}>
              <div className="relative h-40 overflow-hidden">
                <img
                  src={resource.image}
                  alt={resource.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <StatusBadge status={resource.status} />
                </div>
              </div>
            </Link>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <Link href={`/facilities/${resource.id}/`} className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">
                    {resource.name}
                  </p>
                </Link>
                {canManage && (
                  <div className="relative ml-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === resource.id ? null : resource.id)
                      }
                      className="p-1 rounded hover:bg-gray-100 text-muted"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === resource.id && (
                      <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-border bg-white shadow-lg py-1">
                        <Link
                          href={`/facilities/${resource.id}/`}
                          className="flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-gray-50"
                        >
                          <Pencil size={14} /> Edit
                        </Link>
                        {user?.role === "ADMIN" && (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-1.5 space-y-1">
                <p className="flex items-center gap-1.5 text-[12px] text-muted">
                  <MapPin size={12} />
                  {resource.location}
                </p>
                {resource.capacity && (
                  <p className="flex items-center gap-1.5 text-[12px] text-muted">
                    <Users size={12} />
                    Capacity: {resource.capacity}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <StatusBadge status={resource.type} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  return (
    <MainLayout>
      <FacilitiesContent />
    </MainLayout>
  );
}
