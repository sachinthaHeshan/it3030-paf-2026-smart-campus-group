"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  AlertTriangle,
  Users,
  Bell,
  Settings,
  HelpCircle,
  CirclePlus,
  UserCircle,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/", icon: LayoutDashboard },
  { label: "Facilities", href: "/facilities/", icon: Building2 },
  { label: "Bookings", href: "/bookings/", icon: CalendarDays },
  { label: "Incidents", href: "/incidents/", icon: AlertTriangle },
  { label: "Notifications", href: "/notifications/", icon: Bell },
  {
    label: "User Management",
    href: "/user-management/",
    icon: Users,
    roles: ["ADMIN"],
  },
];

const bottomItems: NavItem[] = [
  { label: "Profile", href: "/profile/", icon: UserCircle },
  { label: "Settings", href: "/settings/", icon: Settings },
  { label: "Help", href: "/help/", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || "USER";

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col bg-sidebar-bg text-sidebar-text">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
          U
        </div>
        <div>
          <p className="text-white font-semibold text-[15px] leading-tight">
            UniFlow
          </p>
          <p className="text-sidebar-text text-[11px]">SmartCampus</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href.replace(/\/$/, ""));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/incidents/new/"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-primary-dark mb-4"
        >
          <CirclePlus size={18} />
          <span>Report Incident</span>
        </Link>

        <div className="space-y-1 border-t border-white/10 pt-3">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href.replace(/\/$/, ""));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
