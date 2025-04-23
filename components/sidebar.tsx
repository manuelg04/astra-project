"use client"; // Necesario para hooks como useState y componentes interactivos

import React, { useState } from "react";
import Link from "next/link";
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
import { Settings, ChevronDown, BookOpen } from "lucide-react";

// Mock Data (reemplaza con tus datos reales)
const brands = [
  { id: "brand1", name: "Brand Principal" },
  { id: "brand2", name: "Otra Brand" },
];

const spaceGroups = [
  {
    id: "sg1",
    name: "Marketing Digital",
    emoji: "🚀",
    contentTypes: [{ id: "cursos", name: "Cursos", icon: BookOpen }],
  },
  {
    id: "sg2",
    name: "Desarrollo Web",
    emoji: "💻",
    contentTypes: [{ id: "cursos", name: "Cursos", icon: BookOpen }],
  },
  {
    id: "sg3",
    name: "Diseño UX/UI",
    emoji: "🎨",
    contentTypes: [{ id: "cursos", name: "Cursos", icon: BookOpen }],
  },
];

// Mock User Data (reemplaza con datos reales o props)
const mockUser = {
  fullName: "Usuario Demo",
  avatarUrl: "https://github.com/shadcn.png", // URL de imagen de ejemplo
};

// interface SidebarProps {
//   user: UserProfile | null; // Descomenta si pasas el usuario como prop
// }

export default function Sidebar(/* { user } */) {
  // Descomenta si pasas el usuario como prop
  const [selectedBrand, setSelectedBrand] = useState(brands[0].id);
  const user = mockUser; // Usando mock data por ahora

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Sección 1: Brand Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
      </div>

      {/* Sección 2: Space Groups (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Space Groups
        </h2>
        <Accordion type="multiple" className="w-full">
          {spaceGroups.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionTrigger className="text-sm font-medium hover:no-underline justify-between w-full group">
                <div className="flex items-center gap-2">
                  <span>{group.emoji}</span>
                  <span>{group.name}</span>
                </div>
                {/* Icono de tuerca (aparece al hacer hover en el trigger) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 pl-4">
                  {group.contentTypes.map((contentType) => (
                    <li key={contentType.id}>
                      {/* Enlace para navegar a la página específica */}
                      <Link
                        href={`/dashboard/${selectedBrand}/${group.id}/${contentType.id}`}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm font-normal h-8 px-2"
                        >
                          <contentType.icon className="mr-2 h-4 w-4" />
                          {contentType.name}
                        </Button>
                      </Link>
                    </li>
                  ))}
                  {/* Aquí puedes añadir más tipos de contenido en el futuro (Chats, Events, etc.) */}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Sección 3: User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
              <AvatarFallback>
                {user?.fullName
                  ? user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {user?.fullName ?? "User"}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
