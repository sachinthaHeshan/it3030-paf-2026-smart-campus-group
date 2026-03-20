"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { Search, ShieldCheck, ShieldOff } from "lucide-react";

const ROLES = ["USER", "TECHNICIAN", "MANAGER", "ADMIN"];

const mockUsers = [
  {
    id: 1,
    name: "Alex Rivera",
    email: "alex.rivera@university.edu",
    role: "USER",
    isActive: true,
    profilePicture: null,
    createdAt: "2024-08-15",
  },
  {
    id: 2,
    name: "Dr. Sarah Chen",
    email: "sarah.chen@university.edu",
    role: "MANAGER",
    isActive: true,
    profilePicture: null,
    createdAt: "2024-06-01",
  },
  {
    id: 3,
    name: "John Doe",
    email: "john.doe@university.edu",
    role: "TECHNICIAN",
    isActive: true,
    profilePicture: null,
    createdAt: "2024-07-20",
  },
  {
    id: 4,
    name: "Lisa Wang",
    email: "lisa.wang@university.edu",
    role: "USER",
    isActive: true,
    profilePicture: null,
    createdAt: "2024-09-10",
  },
  {
    id: 5,
    name: "Robert Lee",
    email: "robert.lee@university.edu",
    role: "TECHNICIAN",
    isActive: false,
    profilePicture: null,
    createdAt: "2024-05-01",
  },
  {
    id: 6,
    name: "Admin User",
    email: "admin@university.edu",
    role: "ADMIN",
    isActive: true,
    profilePicture: null,
    createdAt: "2024-01-01",
  },
];

function UserManagementContent() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = mockUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && u.isActive) ||
      (activeFilter === "inactive" && !u.isActive);
    return matchesSearch && matchesRole && matchesActive;
  });

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="User Management"
        subtitle="Manage user accounts and permissions"
      />

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card-bg pl-9 pr-4 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card-bg px-3 text-[13px] outline-none focus:border-primary"
        >
          <option value="All">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-2 text-[12px] font-medium transition-colors ${
                activeFilter === f
                  ? "bg-primary text-white"
                  : "bg-card-bg text-muted hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-card-bg border border-border shadow-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-5 py-3 text-left font-medium text-muted">
                User
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Email
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Role
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Status
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted">
                Joined
              </th>
              <th className="px-5 py-3 text-right font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[12px] font-semibold">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">
                      {u.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted">{u.email}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={u.role} />
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${u.isActive ? "text-green-600" : "text-red-500"}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-green-500" : "bg-red-500"}`}
                    />
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted">{u.createdAt}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      defaultValue={u.role}
                      className="h-8 rounded border border-border bg-white px-2 text-[12px] outline-none focus:border-primary"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={`rounded p-1.5 transition-colors ${
                        u.isActive
                          ? "text-red-500 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={u.isActive ? "Deactivate" : "Activate"}
                    >
                      {u.isActive ? (
                        <ShieldOff size={16} />
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <MainLayout>
      <UserManagementContent />
    </MainLayout>
  );
}
