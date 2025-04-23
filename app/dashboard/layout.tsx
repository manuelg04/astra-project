import Sidebar from "@/components/sidebar";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
