"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="ml-[220px] flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
          <footer className="border-t border-border bg-white px-6 py-4 text-center text-[12px] text-muted">
            &copy; {new Date().getFullYear()} UniFlow &bull; Privacy Policy &bull; Campus Map
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}
