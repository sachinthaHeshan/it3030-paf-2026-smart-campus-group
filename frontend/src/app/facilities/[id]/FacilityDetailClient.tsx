"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";
import BookingHeatmap, {
  type HeatmapCell,
} from "@/components/ui/BookingHeatmap";
import {
  MapPin,
  Users,
  Clock,
  Pencil,
  Trash2,
  Power,
  Loader2,
  Activity,
} from "lucide-react";

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

interface HeatmapData {
  weeks: number;
  maxCount: number;
  cells: HeatmapCell[];
}

const HEATMAP_WEEKS = 4;

export default function FacilityDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const canEdit = user?.role === "MANAGER" || user?.role === "ADMIN";
  const canDelete = user?.role === "ADMIN";
  const canChangeStatus =
    user?.role === "TECHNICIAN" ||
    user?.role === "MANAGER" ||
    user?.role === "ADMIN";

  const [resource, setResource] = useState<Resource | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<Resource>(
          `/api/resources/${params.id}`,
        );
        setResource(data);
      } catch {
        setError("Failed to load resource.");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) load();
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    setHeatmapLoading(true);
    apiFetch<HeatmapData>(
      `/api/resources/${params.id}/heatmap?weeks=${HEATMAP_WEEKS}`,
    )
      .then(setHeatmap)
      .catch(() => setHeatmap(null))
      .finally(() => setHeatmapLoading(false));
  }, [params.id]);

  const handleStatusToggle = async () => {
    if (!resource) return;
    const newStatus =
      resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    setStatusLoading(true);
    try {
      const updated = await apiFetch<Resource>(
        `/api/resources/${resource.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        },
      );
      setResource(updated);
    } catch {
      setErrorModal("Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!resource) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/resources/${resource.id}`, { method: "DELETE" });
      router.push("/facilities/");
    } catch {
      setShowDeleteModal(false);
      setErrorModal("Failed to delete resource.");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-[14px] text-muted">Loading resource...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !resource) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <PageHeader title="Resource Not Found" backHref="/facilities/" />
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-[14px] text-red-600">
              {error || "Resource not found."}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={resource.name}
          backHref="/facilities/"
          actions={
            <div className="flex items-center gap-2">
              {canChangeStatus && (
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={handleStatusToggle}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Power size={14} />
                  {statusLoading
                    ? "Updating..."
                    : resource.status === "ACTIVE"
                      ? "Mark Out of Service"
                      : "Mark Active"}
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => router.push(`/facilities/${resource.id}/edit/`)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          }
        />

        <div className="space-y-6">
          {resource.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-border shadow-sm">
              <img
                src={resource.imageUrl}
                alt={resource.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={resource.status} />
              <StatusBadge status={resource.type} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Location
                  </p>
                  <p className="text-[14px] text-foreground flex items-center gap-2">
                    <MapPin size={14} className="text-muted" />
                    {resource.location}
                  </p>
                </div>
                {resource.capacity && (
                  <div>
                    <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                      Capacity
                    </p>
                    <p className="text-[14px] text-foreground flex items-center gap-2">
                      <Users size={14} className="text-muted" />
                      {resource.capacity} people
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Created By
                  </p>
                  <p className="text-[14px] text-foreground">
                    {resource.createdByName}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Added On
                  </p>
                  <p className="text-[14px] text-foreground">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {resource.description && (
                <div className="md:col-span-2">
                  <p className="text-[12px] text-muted uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p className="text-[14px] text-foreground leading-relaxed">
                    {resource.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <Activity size={16} className="text-muted" />
                Booking Density (last {HEATMAP_WEEKS} weeks)
              </h2>
              {heatmap && heatmap.maxCount > 0 && (
                <span className="text-[11.5px] text-muted">
                  Peak: {heatmap.maxCount} booking
                  {heatmap.maxCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
            {heatmapLoading ? (
              <div className="flex items-center justify-center py-8 text-muted">
                <Loader2 size={18} className="animate-spin" />
                <span className="ml-2 text-[13px]">Loading heatmap...</span>
              </div>
            ) : !heatmap || heatmap.maxCount === 0 ? (
              <p className="text-[13px] text-muted py-4 text-center">
                No bookings yet to chart.
              </p>
            ) : (
              <BookingHeatmap
                cells={heatmap.cells}
                maxCount={heatmap.maxCount}
                weeks={heatmap.weeks}
              />
            )}
          </div>

          {resource.availabilityWindows.length > 0 && (
            <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock size={16} className="text-muted" />
                Availability Windows
              </h2>
              <div className="overflow-x-auto rounded-lg border border-border">
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
                    {resource.availabilityWindows.map((slot) => (
                      <tr key={slot.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {slot.dayOfWeek.charAt(0) +
                            slot.dayOfWeek.slice(1).toLowerCase()}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {slot.startTime}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {slot.endTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <ConfirmModal
          open={showDeleteModal}
          title="Delete Resource"
          message="Are you sure you want to delete this resource? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
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
    </MainLayout>
  );
}
