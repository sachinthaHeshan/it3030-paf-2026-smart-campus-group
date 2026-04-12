"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Loader2 } from "lucide-react";

interface ResourceOption {
  id: number;
  name: string;
  type: string;
  capacity: number | null;
  location: string;
}

function NewBookingContent() {
  const router = useRouter();

  const [resources, setResources] = useState<ResourceOption[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  const [resourceId, setResourceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ResourceOption[]>("/api/bookings/resources")
      .then(setResources)
      .catch(() => setError("Failed to load resources"))
      .finally(() => setLoadingResources(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resourceId || !bookingDate || !startTime || !endTime || !purpose.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (endTime <= startTime) {
      setError("End time must be after start time");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          resourceId: Number(resourceId),
          bookingDate,
          startTime,
          endTime,
          purpose: purpose.trim(),
          expectedAttendees: expectedAttendees
            ? Number(expectedAttendees)
            : null,
        }),
      });
      router.push("/bookings/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="New Booking Request"
        subtitle="Reserve a resource for your activity"
        backHref="/bookings/"
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-card-bg border border-border shadow-sm p-6"
      >
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1">
              Resource *
            </label>
            {loadingResources ? (
              <div className="flex items-center gap-2 text-[13px] text-muted py-2">
                <Loader2 size={14} className="animate-spin" />
                Loading resources...
              </div>
            ) : (
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary"
              >
                <option value="">Select a resource...</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.location}
                    {r.capacity ? ` (capacity: ${r.capacity})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1">
              Date *
            </label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1">
              Purpose *
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe the purpose of your booking..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1">
              Expected Attendees
            </label>
            <input
              type="number"
              min="1"
              value={expectedAttendees}
              onChange={(e) => setExpectedAttendees(e.target.value)}
              placeholder="Number of attendees"
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-border">
          <a
            href="/bookings/"
            className="rounded-lg border border-border px-5 py-2.5 text-[13px] font-medium text-foreground hover:bg-gray-50 transition-colors"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <MainLayout>
      <NewBookingContent />
    </MainLayout>
  );
}
