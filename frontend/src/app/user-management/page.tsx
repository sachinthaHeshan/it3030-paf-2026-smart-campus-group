"use client";

import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { apiFetch } from "@/lib/api";
import { Search, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";

const ROLES = ["USER", "TECHNICIAN", "MANAGER", "ADMIN"];

interface UserRecord {
  id: number;
  email: string;
  name: string;
  profilePicture: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

function UserManagementContent() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<UserRecord[]>("/api/admin/users");
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      const updated = await apiFetch<UserRecord>(
        `/api/admin/users/${userId}/role`,
        { method: "PUT", body: JSON.stringify({ role: newRole }) },
      );
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch {
      alert("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (userId: number, active: boolean) => {
    setUpdatingId(userId);
    try {
      const updated = await apiFetch<UserRecord>(
        `/api/admin/users/${userId}/status`,
        { method: "PUT", body: JSON.stringify({ active }) },
      );
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="ml-2 text-[14px] text-muted">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <PageHeader
          title="User Management"
          subtitle="Manage user accounts and permissions"
        />
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-[14px] text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchUsers();
            }}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} registered user${users.length !== 1 ? "s" : ""}`}
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
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-muted text-[13px]"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-gray-50 ${updatingId === u.id ? "opacity-60" : ""}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {u.profilePicture ? (
                        <img
                          src={u.profilePicture}
                          alt={u.name}
                          className="h-8 w-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[12px] font-semibold">
                          {u.name.charAt(0)}
                        </div>
                      )}
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
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updatingId === u.id}
                        className="h-8 rounded border border-border bg-white px-2 text-[12px] outline-none focus:border-primary disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(u.id, !u.isActive)}
                        disabled={updatingId === u.id}
                        className={`rounded p-1.5 transition-colors disabled:opacity-50 ${
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
              ))
            )}
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
