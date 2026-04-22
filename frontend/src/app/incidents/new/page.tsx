"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { uploadFile } from "@/lib/supabase";
import {
  TICKET_CATEGORIES as CATEGORIES,
  TICKET_PRIORITIES as PRIORITIES,
  incidentFormSchema,
  imageFileSchema,
  firstZodMessage,
} from "@/lib/schemas";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Upload, X, Loader2 } from "lucide-react";

interface ResourceOption {
  id: number;
  name: string;
}

interface AttachmentFile {
  file: File;
  preview: string;
}

function NewIncidentContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [location, setLocation] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [resources, setResources] = useState<ResourceOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ResourceOption[]>("/api/bookings/resources")
      .then((data) =>
        setResources(data.map((r) => ({ id: r.id, name: r.name }))),
      )
      .catch(() => {});
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 3 - attachments.length;
    const selected = Array.from(files).slice(0, remaining);

    const validated: AttachmentFile[] = [];
    for (const file of selected) {
      const result = imageFileSchema.safeParse(file);
      if (!result.success) {
        setError(firstZodMessage(result.error, "Invalid attachment."));
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      validated.push({ file, preview: file.name });
    }

    setError("");
    setAttachments((prev) => [...prev, ...validated]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");

    const parsed = incidentFormSchema.safeParse({
      title,
      description,
      category,
      priority,
      location,
      resourceId,
      contactEmail,
      contactPhone,
    });

    if (!parsed.success) {
      setError(firstZodMessage(parsed.error, "Please check your inputs."));
      return;
    }

    const data = parsed.data;
    setSubmitting(true);

    try {
      const ticket = await apiFetch<{ id: number }>("/api/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          location: data.location,
          resourceId: data.resourceId,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
        }),
      });

      const failedUploads: string[] = [];
      for (const att of attachments) {
        try {
          const filePath = await uploadFile("ticket-attachments", att.file);
          await apiFetch(`/api/tickets/${ticket.id}/attachments`, {
            method: "POST",
            body: JSON.stringify({
              fileName: att.file.name,
              filePath,
              fileType: att.file.type,
              fileSize: att.file.size,
            }),
          });
        } catch (err) {
          const reason = err instanceof Error ? err.message : "unknown error";
          failedUploads.push(`${att.file.name} (${reason})`);
        }
      }

      if (failedUploads.length > 0) {
        setError(
          `Ticket created, but ${failedUploads.length} attachment(s) failed to upload: ${failedUploads.join(", ")}. Check that the "ticket-attachments" Supabase bucket exists and is public.`,
        );
        setSubmitting(false);
        return;
      }

      router.push("/incidents/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Report New Incident"
        subtitle="Submit a maintenance or safety issue"
        backHref="/incidents/"
      />

      <div className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-600">
            {error}
          </div>
        )}

        {/* Ticket Details */}
        <div className="rounded-xl bg-card-bg border border-border shadow-sm p-6">
          <h2 className="text-[15px] font-semibold text-foreground mb-4">
            Incident Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information about the incident..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary"
                >
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
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary"
                >
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
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Study Hall 2, Floor 1"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">
                Related Resource (optional)
              </label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:border-primary"
              >
                <option value="">None</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
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
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
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
            Attachments ({attachments.length}/3)
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex gap-4 flex-wrap">
            {attachments.map((att, index) => (
              <div
                key={index}
                className="relative w-28 h-28 rounded-lg bg-gray-100 border border-border flex items-center justify-center"
              >
                <span className="text-[11px] text-muted text-center px-2 break-all">
                  {att.preview}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {attachments.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-danger px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Submitting..." : "Submit Incident"}
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
