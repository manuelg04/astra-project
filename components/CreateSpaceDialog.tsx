"use client";

import { useState, Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth";
import type { SpaceGroupSummary } from "@/hooks/useBrandsTree";
import {
  FolderPlus,
  FileText,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

type CreationStep = 1 | 2;
type SpaceKind = "POSTS" | "COURSES";

interface Props {
  open: boolean;
  brandId: string;
  group: SpaceGroupSummary | null;
  onClose: () => void;
  onCreated: () => void; // disparar mutateBrandsTree
}

// Helper component for Step 2 selection items
const SpaceKindSelector = ({
  id,
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: SpaceKind;
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <label
    htmlFor={`kind-${id}`}
    className={cn(
      "flex items-start gap-4 cursor-pointer rounded-lg border p-4 transition-all duration-200 ease-in-out",
      checked
        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/50 dark:bg-blue-900/30 dark:border-blue-700"
        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50",
    )}
  >
    <Checkbox
      id={`kind-${id}`}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="mt-1 h-5 w-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:border-gray-600"
      aria-labelledby={`title-${id}`}
      aria-describedby={`desc-${id}`}
    />
    <div className="flex-1">
      <span
        id={`title-${id}`}
        className="text-base font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100"
      >
        <Icon
          className={cn(
            "h-5 w-5",
            checked
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400",
          )}
        />
        {title}
      </span>
      <p
        id={`desc-${id}`}
        className="text-sm text-gray-500 dark:text-gray-400 mt-1"
      >
        {description}
      </p>
    </div>
  </label>
);

export default function CreateSpaceDialog({
  open,
  brandId,
  group,
  onClose,
  onCreated,
}: Props) {
  /* pasos internos -------------------------------------------------- */
  const [step, setStep] = useState<CreationStep>(1);
  const [spaceKinds, setSpaceKinds] = useState<Set<SpaceKind>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  const reset = () => {
    setStep(1);
    setSpaceKinds(new Set());
    setIsCreating(false);
    onClose();
  };

  /* creación -------------------------------------------------------- */
  async function handleCreate() {
    if (spaceKinds.size === 0) {
      toast({
        variant: "destructive",
        title: "Selecciona al menos un tipo",
        description:
          "Debes elegir si quieres crear un espacio de Posts o de Cursos (o ambos).",
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast({ variant: "destructive", title: "No autenticado" });
      return;
    }

    setIsCreating(true);
    let createdCount = 0;
    const errors: string[] = [];

    try {
      // Create Post Space if selected
      if (spaceKinds.has("POSTS")) {
        try {
          const res = await fetch(
            `/api/dashboard/${brandId}/${group!.id}/post-spaces`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ name: "Posts", description: null }), // Consider allowing custom names later
            },
          );
          if (!res.ok) {
            const errorData = await res
              .json()
              .catch(() => ({ message: "Error al crear espacio de Posts" }));
            throw new Error(
              errorData.message || "Error al crear espacio de Posts",
            );
          }
          createdCount++;
        } catch (err) {
          errors.push((err as Error).message);
        }
      }

      // Create Course Space if selected
      if (spaceKinds.has("COURSES")) {
        try {
          const res = await fetch(
            `/api/dashboard/${brandId}/${group!.id}/course-spaces`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ title: "Cursos", description: null }), // API expects 'title'
            },
          );
          if (!res.ok) {
            const errorData = await res
              .json()
              .catch(() => ({ message: "Error al crear espacio de Cursos" }));
            throw new Error(
              errorData.message || "Error al crear espacio de Cursos",
            );
          }
          createdCount++;
        } catch (err) {
          errors.push((err as Error).message);
        }
      }

      // Handle results
      if (createdCount > 0 && errors.length === 0) {
        toast({
          title: "¡Espacio(s) creado(s)!",
          description: `Se ${createdCount === 1 ? "ha" : "han"} añadido correctamente.`,
        });
        onCreated(); // refetch global
        reset();
      } else if (createdCount > 0 && errors.length > 0) {
        toast({
          variant: "default", // Use a warning variant if available
          title: "Creación parcial",
          description: `Se crearon ${createdCount} espacio(s), pero ${errors.length} fallaron: ${errors.join("; ")}`,
        });
        onCreated(); // refetch even if partial
        reset();
      } else {
        // All failed
        throw new Error(
          errors.join("; ") || "No se pudo crear ningún espacio.",
        );
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Algo salió mal",
        description: (err as Error).message,
      });
    } finally {
      setIsCreating(false);
    }
  }

  const handleSpaceKindChange = (kind: SpaceKind, checked: boolean) => {
    const next = new Set(spaceKinds);
    if (checked) {
      next.add(kind);
    } else {
      next.delete(kind);
    }
    setSpaceKinds(next);
  };

  /* ----------------------------- UI ------------------------------- */
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && reset()}>
      <DialogContent className="sm:max-w-4xl bg-card border border-border p-0">
        {step === 1 && group && (
          <Fragment>
            <DialogHeader className="p-6 pb-4 border-b border-border">
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <FolderPlus className="h-5 w-5 text-primary" />
                Crear nueva entidad en {group.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Elige qué tipo de contenido quieres añadir a este grupo.
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Próximamente */}
              <div
                className="relative group flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border text-center opacity-60 cursor-not-allowed bg-muted/10"
                onClick={() =>
                  toast({
                    title: "Próximamente",
                    description:
                      "La creación de subgrupos estará disponible pronto.",
                  })
                }
              >
                <FolderPlus className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="font-semibold text-foreground">
                  Space Group
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Organiza spaces relacionados.
                </p>
                <span className="absolute top-2 right-2 bg-yellow-600/20 text-yellow-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Pronto
                </span>
              </div>

              {/* Botón Space */}
              <button
                className="group flex flex-col items-center justify-center p-6 rounded-lg border border-border text-center transition-all hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => setStep(2)}
              >
                <FileText className="h-10 w-10 text-primary group-hover:text-primary/80 mb-3 transition-colors" />
                <span className="font-semibold text-foreground">Space</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Contiene Posts o Cursos.
                </p>
              </button>
            </div>

            <DialogFooter className="p-6 pt-4 border-t border-border bg-muted/10">
              <Button
                variant="ghost"
                onClick={reset}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </DialogFooter>
          </Fragment>
        )}

        {step === 2 && group && (
          <Fragment>
            <DialogHeader className="p-6 pb-4 border-b border-border">
              <DialogTitle className="text-xl font-bold text-foreground">
                Configura tu nuevo Space
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Selecciona qué funcionalidades tendrá este space. Puedes elegir
                una o ambas.
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-4">
              <SpaceKindSelector
                id="POSTS"
                icon={FileText}
                title="Posts"
                description="Para compartir anuncios, noticias y actualizaciones."
                checked={spaceKinds.has("POSTS")}
                onCheckedChange={(checked) =>
                  handleSpaceKindChange("POSTS", checked)
                }
              />
              <SpaceKindSelector
                id="COURSES"
                icon={BookOpen}
                title="Cursos"
                description="Para organizar y gestionar contenido educativo."
                checked={spaceKinds.has("COURSES")}
                onCheckedChange={(checked) =>
                  handleSpaceKindChange("COURSES", checked)
                }
              />
            </div>

            <DialogFooter className="p-6 pt-4 border-t border-border bg-muted/10 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={reset}>
                  Cancelar
                </Button>

                <Button
                  onClick={handleCreate}
                  disabled={spaceKinds.size === 0 || isCreating}
                >
                  {isCreating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creando...
                    </>
                  ) : (
                    <>
                      Crear Space
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
}
