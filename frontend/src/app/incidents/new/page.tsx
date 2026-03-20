"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Upload, X } from "lucide-react";

const CATEGORIES = [
  "ELECTRICAL",
  "PLUMBING",
  "IT_EQUIPMENT",
  "FURNITURE",
  "HVAC",
  "CLEANING",
  "SAFETY",
  "OTHER",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const MOCK_RESOURCES = [
  { id: 1, name: "Collaborative Lab Room 402" },
  { id: 2, name: "Main Lecture Hall A" },
  { id: 3, name: "Boardroom Beta" },
  { id: 4, name: "Makerspace 3D Lab" },
];

function NewIncidentContent() {
  const [images, setImages] = useState<string[]>([]);

  const addMockImage = () => {
    if (images.length < 3) {
      setImages([...images, `image-${images.length + 1}.jpg`]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Report New Incident"
        subtitle="Submit a maintenance or safety issue"
        backHref="/incidents/"
      />

      <div className="space-y-6">
        {/* Ticket Details */}
        <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
          <h2 className="text-[15px] font-semibold text-foreground mb-4">
            Incident Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="Brief description of the issue"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Provide detailed information about the incident..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Category
                </label>
                <select className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary">
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Priority
                </label>
                <select className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary">
                  <option value="">Select priority...</option>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Study Hall 2, Floor 1"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Related Resource (optional)
              </label>
              <select className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary">
                <option value="">None</option>
                {MOCK_RESOURCES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+94 XX XXX XXXX"
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
          <h2 className="text-[15px] font-semibold text-foreground mb-4">
            Attachments ({images.length}/3)
          </h2>
          <div className="flex gap-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative w-28 h-28 rounded-lg bg-gray-100 border border-border flex items-center justify-center"
              >
                <span className="text-[11px] text-muted">{img}</span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <button
                type="button"
                onClick={addMockImage}
                className="w-28 h-28 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-2 text-muted hover:text-primary transition-colors"
              >
                <Upload size={20} />
                <span className="text-[11px]">Upload</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted mt-2">
            Upload up to 3 images (JPG, PNG). Max 5MB each.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <a
            href="/incidents/"
            className="rounded-lg border border-border px-5 py-2.5 text-[13px] font-medium text-foreground hover:bg-gray-50 transition-colors"
          >
            Cancel
          </a>
          <button
            type="button"
            className="rounded-lg bg-danger px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
          >
            Submit Incident
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewIncidentPage() {
  return (
    <MainLayout>
      <NewIncidentContent />
    </MainLayout>
  );
}
