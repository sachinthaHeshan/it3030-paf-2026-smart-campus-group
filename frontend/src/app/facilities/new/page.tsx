"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Plus, Trash2 } from "lucide-react";

const RESOURCE_TYPES = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
  "OTHER_EQUIPMENT",
];

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

interface AvailabilityRow {
  day: string;
  startTime: string;
  endTime: string;
}

function NewFacilityContent() {
  const [availabilityWindows, setAvailabilityWindows] = useState<
    AvailabilityRow[]
  >([{ day: "MONDAY", startTime: "08:00", endTime: "17:00" }]);

  const addWindow = () => {
    setAvailabilityWindows([
      ...availabilityWindows,
      { day: "MONDAY", startTime: "08:00", endTime: "17:00" },
    ]);
  };

  const removeWindow = (index: number) => {
    setAvailabilityWindows(availabilityWindows.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Add New Resource"
        subtitle="Create a new bookable facility or equipment"
        backHref="/facilities/"
      />

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
          <h2 className="text-[15px] font-semibold text-foreground mb-4">
            Resource Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="e.g. Collaborative Lab Room 402"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Type
              </label>
              <select className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary">
                <option value="">Select type...</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Capacity
              </label>
              <input
                type="number"
                placeholder="Number of people"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering Block B, Floor 4"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the resource..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[13px]">
                  <input
                    type="radio"
                    name="status"
                    value="ACTIVE"
                    defaultChecked
                    className="accent-primary"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-[13px]">
                  <input
                    type="radio"
                    name="status"
                    value="OUT_OF_SERVICE"
                    className="accent-primary"
                  />
                  Out of Service
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Windows */}
        <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-foreground">
              Availability Windows
            </h2>
            <button
              type="button"
              onClick={addWindow}
              className="flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary-dark"
            >
              <Plus size={14} /> Add Window
            </button>
          </div>
          <div className="space-y-3">
            {availabilityWindows.map((window, index) => (
              <div key={index} className="flex items-center gap-3">
                <select
                  value={window.day}
                  onChange={(e) => {
                    const updated = [...availabilityWindows];
                    updated[index].day = e.target.value;
                    setAvailabilityWindows(updated);
                  }}
                  className="h-10 rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0) + d.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={window.startTime}
                  onChange={(e) => {
                    const updated = [...availabilityWindows];
                    updated[index].startTime = e.target.value;
                    setAvailabilityWindows(updated);
                  }}
                  className="h-10 rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary"
                />
                <span className="text-muted text-[13px]">to</span>
                <input
                  type="time"
                  value={window.endTime}
                  onChange={(e) => {
                    const updated = [...availabilityWindows];
                    updated[index].endTime = e.target.value;
                    setAvailabilityWindows(updated);
                  }}
                  className="h-10 rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeWindow(index)}
                  className="p-2 text-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <a
            href="/facilities/"
            className="rounded-lg border border-border px-5 py-2.5 text-[13px] font-medium text-foreground hover:bg-gray-50 transition-colors"
          >
            Cancel
          </a>
          <button
            type="button"
            className="rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            Create Resource
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewFacilityPage() {
  return (
    <MainLayout>
      <NewFacilityContent />
    </MainLayout>
  );
}
