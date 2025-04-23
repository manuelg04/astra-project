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

import { getUserProfile, UserProfile } from "@/lib/auth";
import EditSpaceGroupDialog from "./space-groups/EditSpaceGroupDialog";
import ThemeToggle from "./ThemeToggle";
import {
  BrandSummary,
  CourseSpaceSummary,
  mutateBrandsTree,
  SpaceGroupSummary,
  useBrandsTree,
} from "@/hooks/useBrandsTree";

/* ---------------------------------------------------------------- */
export default function Sidebar() {
  /* 1 · perfil del usuario ---------------------------------------- */
  const [user, setUser] = useState<UserProfile | null>(null);
  useEffect(() => {
    getUserProfile()
      .then(setUser)
      .catch(() => {});
  }, []);

  /* 2 · brands vía SWR ------------------------------------------- */
  const { data, error, isLoading } = useBrandsTree();
  const brands: BrandSummary[] = data?.brands ?? [];

  /* 3 · brand seleccionada --------------------------------------- */
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  useEffect(() => {
    if (!selectedBrand && brands.length) setSelectedBrand(brands[0].id);
  }, [brands, selectedBrand]);

  /* 4 · modal edición -------------------------------------------- */
  const [editing, setEditing] = useState<SpaceGroupSummary | null>(null);

  /* ----------------- estados de carga / error ------------------- */
  if (isLoading) {
    return (
      <div className="w-64 h-full flex items-center justify-center border-r border-gray-200 dark:border-gray-700">
        <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 h-full flex items-center justify-center border-r border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500">Error al cargar comunidades</p>
      </div>
    );
  }

  /* --------------------------- UI ------------------------------- */
  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Selector de Brand ------------------------------------------------ */}
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

      {/* Space Groups ---------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Space Groups
        </h2>

        {brands.length === 0 || !selectedBrand ? (
          <p className="text-sm text-gray-500">Crea tu primera comunidad.</p>
        ) : (
          brands
            .find((b) => b.id === selectedBrand)!
            .spaceGroups.map((group: SpaceGroupSummary) => (
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
                      className="h-6 w-6 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(group);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 pl-4">
                      {group.courseSpaces.map((cs: CourseSpaceSummary) => (
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
            ))
        )}

        {/* Modal edición ------------------------------------------- */}
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
          onSaved={() => mutateBrandsTree()} // refetch global
        />
      </div>

      <ThemeToggle />

      {/* Info usuario --------------------------------------------------- */}
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
