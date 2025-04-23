// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getUserProfile, logout, UserProfile } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getUserProfile();
        if (profile) setUser(profile);
        else router.push("/auth");
      } catch {
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = async () => {
    logout();
    router.push("/auth");
  };

  if (loading) {
    return (
      // El layout ya provee un fondo, ajusta si es necesario
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // El layout ya proporciona padding (p-6), así que no necesitamos contenedores extra aquí a menos que sea específico para esta página.
  return (
    <div>
      {/* Header simple dentro del contenido principal si aún lo deseas */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard Overview
        </h1>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>

      {/* Contenido principal de la página */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Welcome to Your Dashboard!
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            You've successfully authenticated and reached the dashboard.
          </p>
          {user && (
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-xl">
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Logged in as: <span className="font-bold">{user.fullName}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
