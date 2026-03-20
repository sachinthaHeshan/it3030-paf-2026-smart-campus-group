const styleMap: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-gray-100 text-gray-600",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-orange-100 text-orange-700",
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-teal-100 text-teal-700",
  Resolved: "bg-teal-100 text-teal-700",
  CLOSED: "bg-gray-200 text-gray-500",
  ACTIVE: "bg-green-500 text-white",
  OUT_OF_SERVICE: "bg-red-500 text-white",
  "AVAILABLE NOW": "bg-green-500 text-white",
  "IN USE": "bg-gray-700 text-white",
  MAINTENANCE: "bg-red-500 text-white",
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
  USER: "bg-blue-100 text-blue-700",
  TECHNICIAN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-indigo-100 text-indigo-700",
  ADMIN: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${styleMap[status] || "bg-gray-100 text-gray-600"}`}
    >
      {label}
    </span>
  );
}
