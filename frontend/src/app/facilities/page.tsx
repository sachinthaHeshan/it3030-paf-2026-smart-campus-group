"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Plus,
  Search,
  MapPin,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
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

interface AvailabilityWindow {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface Resource {
  id: number;
  name: string;
  type: string;
  capacity: number | null;
  location: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  availabilityWindows: AvailabilityWindow[];
}

interface ResourceListResponse {
  resources: Resource[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

function FacilitiesContent() {
  const { user } = useAuth();
  const canManage = user?.role === "MANAGER" || user?.role === "ADMIN";

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [locationFilter, setLocationFilter] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "All Types") params.set("type", typeFilter);
      if (search.trim()) params.set("search", search.trim());
      if (locationFilter.trim()) params.set("location", locationFilter.trim());
      if (minCapacity) params.set("minCapacity", minCapacity);
      if (maxCapacity) params.set("maxCapacity", maxCapacity);
      params.set("page", String(page));
      params.set("size", "12");

      const data = await apiFetch<ResourceListResponse>(
        `/api/resources?${params.toString()}`,
      );
      setResources(data?.resources ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
    } catch {
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search, locationFilter, minCapacity, maxCapacity, page]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    setPage(0);
  }, [typeFilter, search, locationFilter, minCapacity, maxCapacity]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget);
    try {
      await apiFetch(`/api/resources/${deleteTarget}`, { method: "DELETE" });
      setOpenMenu(null);
      setDeleteTarget(null);
      fetchResources();
    } catch {
      setDeleteTarget(null);
      setErrorModal("Failed to delete resource.");
    } finally {
      setDeleting(null);
    }
  };

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
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="h-10 w-full sm:w-44 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
        />
        <input
          type="number"
          placeholder="Min capacity"
          value={minCapacity}
          onChange={(e) => setMinCapacity(e.target.value)}
          className="h-10 w-full sm:w-32 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
          min={0}
        />
        <input
          type="number"
          placeholder="Max capacity"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          className="h-10 w-full sm:w-32 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
          min={0}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-[14px] text-muted">
            Loading resources...
          </span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-[14px] text-red-600">{error}</p>
          <button
            type="button"
            onClick={fetchResources}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && resources.length === 0 && (
        <div className="rounded-xl bg-card-bg border border-border p-12 text-center">
          <p className="text-[14px] text-muted">No resources found.</p>
        </div>
      )}

      {/* Resource Grid */}
      {!loading && !error && resources.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group relative rounded-xl bg-card-bg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/facilities/${resource.id}/`}>
                  <div className="relative h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {resource.imageUrl ? (
                      <img
                        src={resource.imageUrl}
                        alt={resource.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted text-[12px]">
                        {resource.type.replace(/_/g, " ")}
                      </span>
                    )}
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={resource.status} />
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/facilities/${resource.id}/`}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-[14px] font-semibold text-foreground truncate">
                        {resource.name}
                      </p>
                    </Link>
                    {canManage && (
                      <div className="relative ml-2">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === resource.id ? null : resource.id,
                            )
                          }
                          className="p-1 rounded hover:bg-gray-100 text-muted"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === resource.id && (
                          <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-border bg-white shadow-lg py-1">
                            <Link
                              href={`/facilities/${resource.id}/edit/`}
                              className="flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-gray-50"
                            >
                              <Pencil size={14} /> Edit
                            </Link>
                            {user?.role === "ADMIN" && (
                              <button
                                type="button"
                                disabled={deleting === resource.id}
                                onClick={() => setDeleteTarget(resource.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                <Trash2 size={14} />{" "}
                                {deleting === resource.id
                                  ? "Deleting..."
                                  : "Delete"}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-[13px] text-muted">
                Showing {page * 12 + 1}–
                {Math.min((page + 1) * 12, totalElements)} of {totalElements}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-[13px] font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-[13px] text-muted px-2">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-[13px] font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
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

export default function FacilitiesPage() {
  return (
    <MainLayout>
      <FacilitiesContent />
    </MainLayout>
  );
}
