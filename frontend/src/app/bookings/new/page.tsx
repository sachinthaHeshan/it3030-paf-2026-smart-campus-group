"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { makeBookingFormSchema, firstZodMessage } from "@/lib/schemas";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Loader2,
  Clock,
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  ShieldCheck,
  Ban,
} from "lucide-react";

interface ResourceOption {
  id: number;
  name: string;
  type: string;
  capacity: number | null;
  location: string;
}

interface ScheduleBooking {
  id: number;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  userName: string;
}

interface AvailabilityWindow {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const TIMELINE_START = 6;
const TIMELINE_END = 22;
const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function hasOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return (
    timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(endA) > timeToMinutes(startB)
  );
}

function isWithinWindows(
  start: string,
  end: string,
  windows: AvailabilityWindow[],
): boolean {
  if (windows.length === 0) return true;
  return windows.some(
    (w) =>
      timeToMinutes(start) >= timeToMinutes(w.startTime) &&
      timeToMinutes(end) <= timeToMinutes(w.endTime),
  );
}

function TimelineBar({
  bookings,
  availability,
  userStart,
  userEnd,
}: {
  bookings: ScheduleBooking[];
  availability: AvailabilityWindow[];
  userStart: string;
  userEnd: string;
}) {
  const totalMinutes = TIMELINE_HOURS * 60;

  const getPosition = (time: string) => {
    const mins = timeToMinutes(time) - TIMELINE_START * 60;
    return Math.max(0, Math.min(100, (mins / totalMinutes) * 100));
  };

  const hours = Array.from(
    { length: TIMELINE_HOURS + 1 },
    (_, i) => TIMELINE_START + i,
  );

  const hasUser = userStart && userEnd && userEnd > userStart;
  const userConflict =
    hasUser &&
    bookings.some((b) => hasOverlap(userStart, userEnd, b.startTime, b.endTime));
  const userOutsideWindow =
    hasUser &&
    availability.length > 0 &&
    !isWithinWindows(userStart, userEnd, availability);

  return (
    <div className="mt-1">
      <div className="relative h-10 bg-gray-200/60 rounded-lg overflow-hidden border border-border">
        {/* Available windows as green background */}
        {availability.map((w, i) => {
          const left = getPosition(w.startTime);
          const right = getPosition(w.endTime);
          return (
            <div
              key={`aw-${i}`}
              title={`Available: ${w.startTime} - ${w.endTime}`}
              className="absolute top-0 bottom-0 bg-green-100/80"
              style={{ left: `${left}%`, width: `${Math.max(right - left, 0.5)}%` }}
            />
          );
        })}

        {/* If no windows defined, entire bar is available */}
        {availability.length === 0 && (
          <div className="absolute inset-0 bg-green-50/60" />
        )}

        {/* Existing bookings */}
        {bookings.map((b) => {
          const left = getPosition(b.startTime);
          const right = getPosition(b.endTime);
          const width = right - left;
          const isApproved = b.status === "APPROVED";
          return (
            <div
              key={b.id}
              title={`${b.startTime} - ${b.endTime}: ${b.purpose} (${b.status})`}
              className={`absolute top-1 bottom-1 rounded ${isApproved ? "bg-red-400/80" : "bg-orange-400/70"}`}
              style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
            />
          );
        })}

        {/* User selection */}
        {hasUser && (
          <div
            className={`absolute top-0.5 bottom-0.5 rounded border-2 ${
              userConflict || userOutsideWindow
                ? "border-red-600 bg-red-500/30"
                : "border-blue-600 bg-blue-500/20"
            }`}
            style={{
              left: `${getPosition(userStart)}%`,
              width: `${Math.max(getPosition(userEnd) - getPosition(userStart), 0.5)}%`,
            }}
          />
        )}
      </div>

      {/* Hour labels */}
      <div className="relative h-4 mt-0.5">
        {hours.map((h) => {
          const pos = ((h - TIMELINE_START) / TIMELINE_HOURS) * 100;
          return (
            <span
              key={h}
              className="absolute text-[9px] text-muted -translate-x-1/2"
              style={{ left: `${pos}%` }}
            >
              {String(h).padStart(2, "0")}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted flex-wrap">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2.5 rounded bg-green-100 border border-green-300" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2.5 rounded bg-red-400/80" />
          Approved
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2.5 rounded bg-orange-400/70" />
          Pending
        </span>
        {hasUser && (
          <span className="flex items-center gap-1">
            <span
              className={`inline-block w-3 h-2.5 rounded border-2 ${
                userConflict || userOutsideWindow
                  ? "border-red-600 bg-red-500/30"
                  : "border-blue-600 bg-blue-500/20"
              }`}
            />
            Your selection
          </span>
        )}
      </div>
    </div>
  );
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

  const [schedule, setSchedule] = useState<ScheduleBooking[]>([]);
  const [availability, setAvailability] = useState<AvailabilityWindow[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ResourceOption[]>("/api/bookings/resources")
      .then(setResources)
      .catch(() => setError("Failed to load resources"))
      .finally(() => setLoadingResources(false));
  }, []);

  const fetchScheduleAndAvailability = useCallback(
    async (resId: string, date: string) => {
      if (!resId || !date) {
        setSchedule([]);
        setAvailability([]);
        return;
      }
      setLoadingSchedule(true);
      try {
        const [scheduleData, availData] = await Promise.all([
          apiFetch<ScheduleBooking[]>(
            `/api/bookings/schedule?resourceId=${resId}&date=${date}`,
          ),
          apiFetch<AvailabilityWindow[]>(
            `/api/bookings/availability?resourceId=${resId}&date=${date}`,
          ),
        ]);
        setSchedule(scheduleData || []);
        setAvailability(availData || []);
      } catch {
        setSchedule([]);
        setAvailability([]);
      } finally {
        setLoadingSchedule(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchScheduleAndAvailability(resourceId, bookingDate);
  }, [resourceId, bookingDate, fetchScheduleAndAvailability]);

  const conflict = useMemo(() => {
    if (!startTime || !endTime || endTime <= startTime || schedule.length === 0)
      return null;
    return schedule.find((b) =>
      hasOverlap(startTime, endTime, b.startTime, b.endTime),
    ) || null;
  }, [startTime, endTime, schedule]);

  const outsideAvailability = useMemo(() => {
    if (!startTime || !endTime || endTime <= startTime) return false;
    if (availability.length === 0) return false;
    return !isWithinWindows(startTime, endTime, availability);
  }, [startTime, endTime, availability]);

  const selectedResource = useMemo(
    () => resources.find((r) => String(r.id) === resourceId) || null,
    [resources, resourceId],
  );

  const overCapacity = useMemo(() => {
    if (!selectedResource?.capacity) return false;
    if (!expectedAttendees.trim() || !/^\d+$/.test(expectedAttendees.trim()))
      return false;
    return Number.parseInt(expectedAttendees, 10) > selectedResource.capacity;
  }, [expectedAttendees, selectedResource]);

  const hasBlocker = !!conflict || outsideAvailability || overCapacity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = makeBookingFormSchema(selectedResource?.capacity).safeParse({
      resourceId,
      bookingDate,
      startTime,
      endTime,
      purpose,
      expectedAttendees,
    });

    if (!parsed.success) {
      setError(firstZodMessage(parsed.error, "Please check your inputs."));
      return;
    }

    if (conflict) {
      setError(
        "Your selected time conflicts with an existing booking. Please choose a different time.",
      );
      return;
    }

    if (outsideAvailability) {
      setError(
        "Your selected time is outside this resource's availability hours.",
      );
      return;
    }

    const data = parsed.data;

    setSubmitting(true);
    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          resourceId: Number(data.resourceId),
          bookingDate: data.bookingDate,
          startTime: data.startTime,
          endTime: data.endTime,
          purpose: data.purpose,
          expectedAttendees: data.expectedAttendees,
        }),
      });
      router.push("/bookings/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const showSchedulePanel = resourceId && bookingDate;

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
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3 text-[13px] text-red-700 flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
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

          {/* Schedule & Availability Panel */}
          {showSchedulePanel && (
            <div className="rounded-lg border border-border bg-gray-50/50 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-muted" />
                <h3 className="text-[13px] font-semibold text-foreground">
                  Schedule for{" "}
                  {new Date(bookingDate + "T00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                {loadingSchedule && (
                  <Loader2 size={13} className="animate-spin text-muted" />
                )}
              </div>

              {/* Availability Windows Info */}
              {!loadingSchedule && (
                <div
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-[12px] border ${
                    availability.length > 0
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-green-50 border-green-200 text-green-800"
                  }`}
                >
                  {availability.length > 0 ? (
                    <>
                      <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Available hours: </span>
                        {availability.map((w, i) => (
                          <span key={i}>
                            {i > 0 && ", "}
                            {w.startTime} - {w.endTime}
                          </span>
                        ))}
                        <span className="text-blue-600 ml-1">
                          (bookings outside these hours are not allowed)
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        No availability restrictions set. Open all day.
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Timeline Bar */}
              <TimelineBar
                bookings={schedule}
                availability={availability}
                userStart={startTime}
                userEnd={endTime}
              />

              {/* Existing bookings list */}
              {!loadingSchedule && schedule.length === 0 && (
                <div className="flex items-center gap-2 text-[12px] text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                  <CheckCircle size={14} />
                  No existing bookings on this date.
                </div>
              )}

              {!loadingSchedule && schedule.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted uppercase tracking-wide">
                    Existing bookings ({schedule.length})
                  </p>
                  {schedule.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 rounded-lg bg-white border border-border px-3 py-2 text-[12px]"
                    >
                      <Clock size={13} className="text-muted shrink-0" />
                      <span className="font-semibold text-foreground whitespace-nowrap">
                        {b.startTime} - {b.endTime}
                      </span>
                      <span className="text-muted truncate flex-1">
                        {b.purpose}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

          {/* Outside Availability Warning */}
          {outsideAvailability && (
            <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 flex items-start gap-2">
              <Ban size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-amber-800">
                  Outside Availability Hours
                </p>
                <p className="text-[12px] text-amber-700 mt-0.5">
                  Your selected time ({startTime} - {endTime}) falls outside
                  this resource&apos;s available hours
                  {availability.length > 0 && (
                    <span>
                      {" "}(
                      {availability.map((w, i) => (
                        <span key={i}>
                          {i > 0 && ", "}
                          {w.startTime}-{w.endTime}
                        </span>
                      ))}
                      )
                    </span>
                  )}
                  . Please choose a time within the available window.
                </p>
              </div>
            </div>
          )}

          {/* Booking Conflict Warning */}
          {conflict && (
            <div className="rounded-lg bg-red-50 border border-red-300 p-3 flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="text-red-600 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-[13px] font-semibold text-red-800">
                  Time Conflict Detected
                </p>
                <p className="text-[12px] text-red-700 mt-0.5">
                  Your selected time ({startTime} - {endTime}) overlaps with an
                  existing {conflict.status.toLowerCase()} booking (
                  {conflict.startTime} - {conflict.endTime}). Please choose a
                  different time slot.
                </p>
              </div>
            </div>
          )}

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
              {selectedResource?.capacity ? (
                <span className="ml-1 text-muted font-normal">
                  (max {selectedResource.capacity})
                </span>
              ) : null}
            </label>
            <input
              type="number"
              min={1}
              max={selectedResource?.capacity ?? undefined}
              step={1}
              value={expectedAttendees}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d+$/.test(v)) setExpectedAttendees(v);
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Number of attendees"
              className={`h-10 w-full rounded-lg border bg-white px-3 text-[13px] outline-none focus:ring-1 ${
                overCapacity
                  ? "border-red-400 focus:border-red-500 focus:ring-red-300"
                  : "border-border focus:border-primary focus:ring-primary/30"
              }`}
            />
            {overCapacity && selectedResource?.capacity && (
              <div className="mt-2 rounded-lg bg-red-50 border border-red-300 p-2.5 flex items-start gap-2">
                <AlertTriangle
                  size={14}
                  className="text-red-600 shrink-0 mt-0.5"
                />
                <p className="text-[12px] text-red-700">
                  Expected attendees ({expectedAttendees}) exceeds this
                  resource&apos;s capacity ({selectedResource.capacity}).
                </p>
              </div>
            )}
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
            disabled={submitting || hasBlocker}
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
