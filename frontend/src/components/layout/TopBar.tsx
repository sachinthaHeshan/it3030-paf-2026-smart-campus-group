"use client";

import { useAuth } from "@/context/AuthContext";
import { Search, Bell, LayoutGrid } from "lucide-react";

export default function TopBar() {
  const { user } = useAuth();

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

        <div className="ml-2 flex items-center gap-3">
          <div className="text-right">
            <p className="text-[13.5px] font-semibold text-foreground leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-muted">
              {user?.role === "USER"
                ? "Student"
                : user?.role || "Member"}
            </p>
          </div>
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
        </div>
      </div>
    </header>
  );
}
