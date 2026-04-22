import { z, ZodError } from "zod";

export const RESOURCE_TYPES = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
  "OTHER_EQUIPMENT",
] as const;

export const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"] as const;

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const TICKET_CATEGORIES = [
  "ELECTRICAL",
  "PLUMBING",
  "IT_EQUIPMENT",
  "FURNITURE",
  "HVAC",
  "CLEANING",
  "SAFETY",
  "OTHER",
] as const;

export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const USER_ROLES = ["USER", "TECHNICIAN", "MANAGER", "ADMIN"] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalTrimmedString = z
  .string()
  .optional()
  .transform((v) => (v ?? "").trim())
  .transform((v) => (v.length === 0 ? null : v));

const capacityField = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null) return "";
    return typeof v === "number" ? String(v) : v.trim();
  })
  .pipe(
    z
      .string()
      .refine((v) => v === "" || /^\d+$/.test(v), {
        message: "Capacity must be a whole number.",
      })
      .transform((v) => (v === "" ? null : Number.parseInt(v, 10)))
      .refine((v) => v === null || v >= 1, {
        message: "Capacity must be at least 1.",
      })
      .refine((v) => v === null || v <= 10000, {
        message: "Capacity must be 10,000 or less.",
      }),
  );

export const availabilityWindowSchema = z
  .object({
    day: z.enum(DAYS_OF_WEEK),
    startTime: z.string().regex(TIME_REGEX, "Invalid start time."),
    endTime: z.string().regex(TIME_REGEX, "Invalid end time."),
  })
  .refine((w) => w.endTime > w.startTime, {
    message: "Each availability window's end time must be after start time.",
    path: ["endTime"],
  });

export const resourceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(150, "Name must be 150 characters or fewer."),
  type: z.enum(RESOURCE_TYPES, { message: "Type is required." }),
  capacity: capacityField,
  location: z
    .string()
    .trim()
    .min(1, "Location is required.")
    .max(255, "Location must be 255 characters or fewer."),
  description: optionalTrimmedString.pipe(
    z
      .string()
      .max(2000, "Description must be 2000 characters or fewer.")
      .nullable(),
  ),
  status: z.enum(RESOURCE_STATUSES).default("ACTIVE"),
  availabilityWindows: z.array(availabilityWindowSchema),
});

export type ResourceFormInput = z.input<typeof resourceFormSchema>;
export type ResourceFormData = z.output<typeof resourceFormSchema>;

export const bookingFormSchema = z
  .object({
    resourceId: z
      .string()
      .min(1, "Please select a resource.")
      .refine((v) => /^\d+$/.test(v), "Please select a resource."),
    bookingDate: z
      .string()
      .min(1, "Please select a date.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
    startTime: z
      .string()
      .min(1, "Start time is required.")
      .regex(TIME_REGEX, "Invalid start time."),
    endTime: z
      .string()
      .min(1, "End time is required.")
      .regex(TIME_REGEX, "Invalid end time."),
    purpose: z
      .string()
      .trim()
      .min(1, "Purpose is required.")
      .max(500, "Purpose must be 500 characters or fewer."),
    expectedAttendees: z
      .string()
      .optional()
      .transform((v) => (v ?? "").trim())
      .pipe(
        z
          .string()
          .refine((v) => v === "" || /^\d+$/.test(v), {
            message: "Expected attendees must be a whole number.",
          })
          .transform((v) => (v === "" ? null : Number.parseInt(v, 10)))
          .refine((v) => v === null || v >= 1, {
            message: "Expected attendees must be at least 1.",
          })
          .refine((v) => v === null || v <= 10000, {
            message: "Expected attendees must be 10,000 or less.",
          }),
      ),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

export type BookingFormInput = z.input<typeof bookingFormSchema>;
export type BookingFormData = z.output<typeof bookingFormSchema>;

/**
 * Build a booking schema that also enforces an upper bound on
 * `expectedAttendees` based on the selected resource's capacity.
 * Pass `null`/`undefined` for resources with no declared capacity.
 */
export const makeBookingFormSchema = (maxCapacity?: number | null) =>
  bookingFormSchema.refine(
    (d) =>
      maxCapacity == null ||
      d.expectedAttendees == null ||
      d.expectedAttendees <= maxCapacity,
    {
      message:
        maxCapacity != null
          ? `Expected attendees cannot exceed this resource's capacity (${maxCapacity}).`
          : "Expected attendees exceeds capacity.",
      path: ["expectedAttendees"],
    },
  );

const optionalEmail = z
  .string()
  .optional()
  .transform((v) => (v ?? "").trim())
  .pipe(
    z
      .string()
      .refine(
        (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        "Please enter a valid email address.",
      )
      .transform((v) => (v === "" ? null : v)),
  );

const optionalPhone = z
  .string()
  .optional()
  .transform((v) => (v ?? "").trim())
  .pipe(
    z
      .string()
      .refine(
        (v) => v === "" || /^[+\d][\d\s\-()]{6,19}$/.test(v),
        "Please enter a valid phone number.",
      )
      .transform((v) => (v === "" ? null : v)),
  );

export const incidentFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(150, "Title must be 150 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description must be 2000 characters or fewer."),
  category: z.enum(TICKET_CATEGORIES, { message: "Category is required." }),
  priority: z.enum(TICKET_PRIORITIES, { message: "Priority is required." }),
  location: z
    .string()
    .trim()
    .min(1, "Location is required.")
    .max(255, "Location must be 255 characters or fewer."),
  resourceId: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .pipe(
      z
        .string()
        .refine((v) => v === "" || /^\d+$/.test(v), "Invalid resource.")
        .transform((v) => (v === "" ? null : Number.parseInt(v, 10))),
    ),
  contactEmail: optionalEmail,
  contactPhone: optionalPhone,
});

export type IncidentFormInput = z.input<typeof incidentFormSchema>;
export type IncidentFormData = z.output<typeof incidentFormSchema>;

export const userEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  role: z.enum(USER_ROLES, { message: "Please choose a valid role." }),
  active: z.boolean(),
});

export type UserEditInput = z.input<typeof userEditSchema>;
export type UserEditData = z.output<typeof userEditSchema>;

export const imageFileSchema = z
  .instanceof(File, { message: "Please select an image file." })
  .refine((f) => f.type.startsWith("image/"), "Please select an image file.")
  .refine(
    (f) => f.size <= 5 * 1024 * 1024,
    "Image must be less than 5MB.",
  );

/**
 * Returns the first error message from a ZodError, suitable for surfacing
 * in a single banner-style alert. Handles unknown errors gracefully.
 */
export function firstZodMessage(err: unknown, fallback = "Invalid input."): string {
  if (err instanceof ZodError) {
    const issue = err.issues[0];
    if (issue?.message) return issue.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
