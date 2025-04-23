/* ------------------------------------------------------------------
   app/dashboard/page.tsx
------------------------------------------------------------------ */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Building2, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { getUserProfile, logout, UserProfile, getAuthToken } from "@/lib/auth";

/* ──────────────────────────────────────────────────────────── */
/*  Tipos – coinciden con la respuesta de /api/brands/tree     */
/* ──────────────────────────────────────────────────────────── */
interface CourseSpaceSummary {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  coursesCount: number;
}

interface SpaceGroupSummary {
  id: string;
  name: string;
  logoUrl: string | null;
  pricingType: "FREE" | "PAID";
  price: string;
  courseSpaces: CourseSpaceSummary[];
}

interface BrandSummary {
  id: string;
  name: string;
  logoUrl: string | null;
  spaceGroups: SpaceGroupSummary[];
}

/* ──────────────────────────────────────────────────────────── */
/*  Componente                                                 */
/* ──────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [loading, setLoading] = useState(true);

  /* 1 · Cargar perfil + brands ------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        /* Perfil ---------------------------------------------------- */
        const profile = await getUserProfile();
        if (!profile) {
          router.push("/auth");
          return;
        }
        setUser(profile);

        /* Brands / SpaceGroups -------------------------------------- */
        const token = getAuthToken();
        if (!token) {
          router.push("/auth");
          return;
        }

        const res = await fetch("/api/brands/tree", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);
        if (!res.ok) throw new Error("Unable to fetch brands");

        const data = (await res.json()) as { brands: BrandSummary[] };
        setBrands(data.brands);
      } catch {
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  /* 2 · Logout ----------------------------------------------------- */
  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  /* 3 · Loading ---------------------------------------------------- */
  if (loading) {
    return (
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

  /* 4 · UI --------------------------------------------------------- */
  return (
    <div>
      {/* Header ----------------------------------------------------- */}
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

      {/* Perfil ----------------------------------------------------- */}
      {user && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Bienvenido, {user.fullName || user.email}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </CardContent>
        </Card>
      )}

      {/* Brands ----------------------------------------------------- */}

    </div>
  );
}
