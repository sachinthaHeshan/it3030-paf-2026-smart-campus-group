"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { Plus, Search } from "lucide-react";

const mockMyTickets = [
  {
    id: 1,
    code: "TK-8821",
    title: "Broken Chair",
    category: "FURNITURE",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    location: "Study Hall 2",
    assignedTo: "John Doe",
    createdAt: "2026-03-18",
  },
  {
    id: 2,
    code: "TK-8904",
    title: "Wi-Fi Latency",
    category: "IT_EQUIPMENT",
    priority: "HIGH",
    status: "OPEN",
    location: "Dorm A",
    assignedTo: null,
    createdAt: "2026-03-20",
  },
  {
    id: 3,
    code: "TK-8750",
    title: "Leaking Faucet",
    category: "PLUMBING",
    priority: "LOW",
    status: "RESOLVED",
    location: "Science Block, Floor 2",
    assignedTo: "Jane Smith",
    createdAt: "2026-03-10",
  },
];

const mockAllTickets = [
  ...mockMyTickets,
  {
    id: 4,
    code: "TK-8910",
    title: "Projector Not Working",
    category: "IT_EQUIPMENT",
    priority: "HIGH",
    status: "OPEN",
    location: "Lecture Hall A",
    assignedTo: null,
    createdAt: "2026-03-21",
  },
  {
    id: 5,
    code: "TK-8895",
    title: "AC Unit Noise",
    category: "HVAC",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    location: "Admin Block, Floor 3",
    assignedTo: "John Doe",
    createdAt: "2026-03-19",
  },
  {
    id: 6,
    code: "TK-8800",
    title: "Emergency Exit Light Out",
    category: "SAFETY",
    priority: "CRITICAL",
    status: "OPEN",
    location: "Engineering Block B",
    assignedTo: null,
    createdAt: "2026-03-15",
  },
];

const CATEGORY_OPTIONS = [
  "All",
  "ELECTRICAL",
  "PLUMBING",
  "IT_EQUIPMENT",
  "FURNITURE",
  "HVAC",
  "CLEANING",
  "SAFETY",
  "OTHER",
];
const PRIORITY_OPTIONS = ["All", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUS_OPTIONS = [
  "All",
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

type TabKey = "my" | "assigned" | "all";

function IncidentsContent() {
  const { user } = useAuth();
  const isTechnician = user?.role === "TECHNICIAN";
  const canViewAll = user?.role === "MANAGER" || user?.role === "ADMIN";
  const [activeTab, setActiveTab] = useState<TabKey>("my");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const tickets =
    activeTab === "all"
      ? mockAllTickets
      : activeTab === "assigned"
        ? mockAllTickets.filter((t) => t.assignedTo === "John Doe")
        : mockMyTickets;

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || t.category === categoryFilter;
    const matchesPriority =
      priorityFilter === "All" || t.priority === priorityFilter;
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const tabs: { key: TabKey; label: string; visible: boolean }[] = [
    { key: "my", label: "My Tickets", visible: true },
    { key: "assigned", label: "Assigned to Me", visible: isTechnician },
    { key: "all", label: "All Tickets", visible: canViewAll },
  ];

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Incidents"
        subtitle="Report and track maintenance incidents"
        actions={
          <Link
            href="/incidents/new/"
            className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
          >
            <Plus size={16} />
            Report Incident
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {tabs
          .filter((t) => t.visible)
          .map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card-bg pl-9 pr-4 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All Categories" : c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p === "All" ? "All Priorities" : p}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card-bg border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-[13px] min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-5 py-3 text-left font-medium text-muted">
                ID
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Title
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Category
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Priority
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Status
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Location
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Assigned To
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5 text-muted font-mono">
                  {ticket.code}
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/incidents/${ticket.id}/`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[12px] text-muted">
                    {ticket.category.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={ticket.priority} />
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-5 py-3.5 text-foreground">
                  {ticket.location}
                </td>
                <td className="px-5 py-3.5 text-foreground">
                  {ticket.assignedTo || (
                    <span className="text-muted italic">Unassigned</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-muted">{ticket.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function IncidentsPage() {
  return (
    <MainLayout>
      <IncidentsContent />
    </MainLayout>
  );
}
