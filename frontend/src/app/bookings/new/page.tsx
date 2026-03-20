"use client";

import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";

const MOCK_RESOURCES = [
  { id: 1, name: "Collaborative Lab Room 402" },
  { id: 2, name: "Main Lecture Hall A" },
  { id: 3, name: "Boardroom Beta" },
  { id: 4, name: "Makerspace 3D Lab" },
  { id: 5, name: "Private Study Pods" },
  { id: 6, name: "Portable Projector #5" },
];

function NewBookingContent() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="New Booking Request"
        subtitle="Reserve a resource for your activity"
        backHref="/bookings/"
      />

      <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1">
              Resource
            </label>
            <select className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary">
              <option value="">Select a resource...</option>
              {MOCK_RESOURCES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1">
              Date
            </label>
            <input
              type="date"
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Start Time
              </label>
              <input
                type="time"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                End Time
              </label>
              <input
                type="time"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1">
              Purpose
            </label>
            <textarea
              rows={3}
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
            type="button"
            className="rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            Submit Request
          </button>
        </div>
      </div>
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
