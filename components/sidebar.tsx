"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, BookOpen, Settings } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { getUserProfile, getAuthToken, UserProfile } from "@/lib/auth";
import EditSpaceGroupDialog from "./space-groups/EditSpaceGroupDialog";

/* --- tipos idénticos al endpoint /api/brands/tree ---------------- */
interface CourseSpaceSummary {
  id: string;
  title: string;
  coursesCount: number;
}

interface SpaceGroupSummary {
  id: string;
  name: string;
  emoji: string | null;
  isPublic: boolean;
  color: string | null;
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

/* ---------------------------------------------------------------- */
export default function Sidebar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SpaceGroupSummary | null>(null);

  /* 1 · Cargar perfil + brands ------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const profile = await getUserProfile();
        if (profile) setUser(profile);

        const token = getAuthToken();
        if (!token) return;

        const res = await fetch("/api/brands/tree", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Cannot fetch brands");

        const data = (await res.json()) as { brands: BrandSummary[] };
        setBrands(data.brands);
        if (data.brands.length) setSelectedBrand(data.brands[0].id);
      } catch {
        // Si falla, mantén el sidebar vacío
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="w-64 h-full flex items-center justify-center border-r border-gray-200 dark:border-gray-700">
        <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Sección 1: Brand Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {brands.length === 0 ? (
          <p className="text-sm text-gray-500">Sin comunidades</p>
        ) : (
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Sección 2: Space Groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Space Groups
        </h2>

        {brands.length === 0 || !selectedBrand ? (
          <p className="text-sm text-gray-500">Crea tu primera comunidad.</p>
        ) : (
          <>
            {brands
              .find((b) => b.id === selectedBrand)!
              .spaceGroups.map((group) => (
                <Accordion
                  key={group.id}
                  type="single"
                  collapsible
                  className="w-full"
                >
                  <AccordionItem value={group.id}>
                    <AccordionTrigger className="text-sm font-medium hover:no-underline justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span>{group.emoji ?? "🌐"}</span>
                        <span>{group.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-100 pointer-events-auto z-10"
                        onClick={(e) => {
                          e.stopPropagation(); // evita abrir/cerrar accordion
                          setEditing(group); // abre modal
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 pl-4">
                        {group.courseSpaces.map((cs) => (
                          <li key={cs.id}>
                            <Link
                              href={`/dashboard/${selectedBrand}/${group.id}/${cs.id}`}
                            >
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-sm font-normal h-8 px-2"
                              >
                                <BookOpen className="mr-2 h-4 w-4" />
                                {cs.title}
                              </Button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
          </>
        )}
        {/* Modal edición */}
        <EditSpaceGroupDialog
          open={!!editing}
          group={
            editing
              ? {
                  ...editing,
                  color: editing.color
                    ? `#${editing.color.replace(/^#/, "")}`
                    : null,
                }
              : null
          }
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            // Actualiza state local sin volver a hacer fetch
            setBrands((prev) =>
              prev.map((b) => ({
                ...b,
                spaceGroups: b.spaceGroups.map((sg) =>
                  sg.id === updated!.id
                    ? {
                        ...sg,
                        ...updated,
                        /* guardamos color sin # para ser coherentes con la DB */
                        color: updated!.color?.replace(/^#/, "") ?? null,
                      }
                    : sg,
                ),
              })),
            );
          }}
        />
      </div>

      {/* Sección 3: User Info */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl ?? ""} alt={user.fullName} />
                <AvatarFallback>
                  {user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {user.fullName}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
