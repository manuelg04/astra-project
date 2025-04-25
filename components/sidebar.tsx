"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Settings,
  BookOpen,
  Book,
  MessageCircle,
  MousePointerSquareDashedIcon,
  Newspaper,
  School,
  BookUser,
  BookOpenText,
  BookOpenTextIcon,
  Pencil,
} from "lucide-react";
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
import CreateSpaceDialog from "./CreateSpaceDialog";
import ThemeToggle from "./ThemeToggle";
import {
  BrandSummary,
  useBrandsTree,
  mutateBrandsTree,
  SpaceGroupSummary,
} from "@/hooks/useBrandsTree";

/* ---------------------------------------------------------------- */
export default function Sidebar() {
  /* usuario ------------------------------------------------------- */
  const [user, setUser] = useState<UserProfile | null>(null);
  useEffect(() => {
    getUserProfile()
      .then(setUser)
      .catch(() => {});
  }, []);

  /* tree ---------------------------------------------------------- */
  const { data, error, isLoading } = useBrandsTree();
  const brands: BrandSummary[] = data?.brands ?? [];

  /* brand seleccionada ------------------------------------------- */
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  useEffect(() => {
    if (!selectedBrand && brands.length) setSelectedBrand(brands[0].id);
  }, [brands, selectedBrand]);

  /* diálogos ------------------------------------------------------ */
  const [editing, setEditing] = useState<SpaceGroupSummary | null>(null);
  const [creating, setCreating] = useState<SpaceGroupSummary | null>(null);

  /* loading / error ---------------------------------------------- */
  if (isLoading)
    return (
      <div className="w-64 h-full flex items-center justify-center bg-sidebar border-r border-sidebar-border">
        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="w-64 h-full flex items-center justify-center bg-sidebar border-r border-sidebar-border">
        <p className="text-sm text-sidebar-foreground/70">
          Error al cargar comunidades
        </p>
      </div>
    );

  /* UI ------------------------------------------------------------ */
  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* brand selector -------------------------------------------- */}
      <div className="p-4 border-b border-sidebar-border">
        {brands.length === 0 ? (
          <p className="text-sm text-sidebar-foreground/70">Sin comunidades</p>
        ) : (
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-full bg-secondary">
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {brands.map((brand) => (
                <SelectItem
                  key={brand.id}
                  value={brand.id}
                  className="focus:bg-accent focus:text-accent-foreground"
                >
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* space groups ---------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
          Space Groups
        </h2>

        {brands.length === 0 || !selectedBrand ? (
          <p className="text-sm text-sidebar-foreground/70">
            Crea tu primera comunidad.
          </p>
        ) : (
          brands
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
                      <span>{group.emoji ?? ""}</span>
                      <span>{group.name}</span>
                    </div>
                    <div className="flex items-center gap-1 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCreating(group);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(group);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 pl-4">
                      {group.postSpaces.map((ps) => (
                        <li key={ps.id}>
                          <Link
                            href={`/dashboard/${selectedBrand}/${group.id}/post-spaces/${ps.id}/posts`}
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-sm font-normal h-8 px-2"
                            >
                              <Newspaper className="mr-2 h-4 w-4" />
                              {ps.name}
                            </Button>
                          </Link>
                        </li>
                      ))}
                      {group.courseSpaces.map((cs) => (
                        <li key={cs.id}>
                          <Link
                            href={`/dashboard/${selectedBrand}/${group.id}/course-spaces/${cs.id}/courses`}
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-sm font-normal h-8 px-2"
                            >
                              <BookOpenTextIcon className="mr-2 h-4 w-4" />
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
          onSaved={() => mutateBrandsTree()}
        />
      </div>

      {/* theme toggle & user --------------------------------------- */}
      <ThemeToggle />

      {user && (
        <div className="p-4 border-t border-sidebar-border">
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
              <span className="text-sm font-medium text-sidebar-foreground">
                {user.fullName}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CreateSpaceDialog
        open={!!creating}
        brandId={selectedBrand ?? ""}
        group={creating}
        onClose={() => setCreating(null)}
        onCreated={() => mutateBrandsTree()}
      />
    </div>
  );
}
