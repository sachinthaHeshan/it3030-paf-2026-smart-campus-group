"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/ui/StatusBadge";
import { Search, Bell, LayoutGrid, LogOut, User } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  USER: "User",
  TECHNICIAN: "Technician",
  MANAGER: "Manager",
  ADMIN: "Administrator",
};

export default function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push("/login/");
  };

  const roleLabel = ROLE_LABELS[user?.role || ""] || user?.role || "Member";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-topbar-bg px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-foreground">UniFlow</h1>
        <div className="relative ml-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search resources, events..."
            className="h-9 w-72 rounded-lg border border-border bg-background pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-muted hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>
        <button
          type="button"
          className="rounded-lg p-2 text-muted hover:bg-gray-100 transition-colors"
        >
          <LayoutGrid size={20} />
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[13.5px] font-semibold text-foreground leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] text-muted">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold ring-2 ring-border">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </button>
          </div>

          {open && (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-border bg-white shadow-lg">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <StatusBadge status={user?.role || "USER"} />
                </div>
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/profile/");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-foreground hover:bg-gray-50 transition-colors"
                >
                  <User size={15} className="text-muted" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
