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
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

type CreationStep = 1 | 2;
type SpaceKind = "POSTS" | "COURSES";

interface Props {
  open: boolean;
  brandId: string;
  group: SpaceGroupSummary | null;
  onClose: () => void;
  onCreated: () => void;
}

/* -------------------------------------------------------------------------- */
/* Selector de tipo de Space                                                  */
/* -------------------------------------------------------------------------- */

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
      "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all duration-200 ease-in-out",
      checked
        ? "border-blue-500 bg-blue-900/30 ring-2 ring-blue-500/50"
        : "border-gray-700 hover:border-blue-600 hover:bg-blue-900/25",
    )}
  >
    <Checkbox
      id={`kind-${id}`}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="mt-1 h-5 w-5 rounded border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
      aria-labelledby={`title-${id}`}
      aria-describedby={`desc-${id}`}
    />
    <div className="flex-1">
      <span
        id={`title-${id}`}
        className="flex items-center gap-2 text-base font-semibold text-gray-200"
      >
        <Icon
          className={cn(
            "h-5 w-5",
            checked ? "text-blue-400" : "text-gray-300",
          )}
        />
        {title}
      </span>
      <p id={`desc-${id}`} className="mt-1 text-sm text-gray-400">
        {description}
      </p>
    </div>
  </label>
);

/* -------------------------------------------------------------------------- */
/* Componente principal                                                       */
/* -------------------------------------------------------------------------- */

export default function CreateSpaceDialog({
  open,
  brandId,
  group,
  onClose,
  onCreated,
}: Props) {
  const [step, setStep] = useState<CreationStep>(1);
  const [spaceKinds, setSpaceKinds] = useState<Set<SpaceKind>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  /* ------------------------------ Auxiliares ----------------------------- */

  const reset = () => {
    setStep(1);
    setSpaceKinds(new Set());
    setIsCreating(false);
    onClose();
  };

  const handleSpaceKindChange = (kind: SpaceKind, checked: boolean) => {
    const next = new Set(spaceKinds);
    checked ? next.add(kind) : next.delete(kind);
    setSpaceKinds(next);
  };

  /* ------------------------------- Crear --------------------------------- */

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
      /* Post-Space -------------------------------------------------------- */
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
              body: JSON.stringify({ name: "Posts", description: null }),
            },
          );
          if (!res.ok) {
            const { message } = await res
              .json()
              .catch(() => ({ message: "Error al crear espacio de Posts" }));
            throw new Error(message);
          }
          createdCount++;
        } catch (err) {
          errors.push((err as Error).message);
        }
      }

      /* Course-Space ------------------------------------------------------ */
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
              body: JSON.stringify({ title: "Cursos", description: null }),
            },
          );
          if (!res.ok) {
            const { message } = await res
              .json()
              .catch(() => ({ message: "Error al crear espacio de Cursos" }));
            throw new Error(message);
          }
          createdCount++;
        } catch (err) {
          errors.push((err as Error).message);
        }
      }

      /* Resultados -------------------------------------------------------- */
      if (createdCount > 0 && errors.length === 0) {
        toast({
          title: "¡Espacio(s) creado(s)!",
          description: `Se ${createdCount === 1 ? "ha" : "han"} añadido correctamente.`,
        });
        onCreated();
        reset();
      } else if (createdCount > 0 && errors.length > 0) {
        toast({
          title: "Creación parcial",
          description: `Se crearon ${createdCount} espacio(s), pero ${errors.length} fallaron: ${errors.join(
            "; ",
          )}`,
        });
        onCreated();
        reset();
      } else {
        throw new Error(errors.join("; ") || "No se pudo crear ningún espacio.");
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

  /* ------------------------------ Render --------------------------------- */

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && reset()}>
      <DialogContent className="border border-border bg-card p-0 sm:max-w-4xl">
        {/* Paso 1 ---------------------------------------------------------- */}
        {step === 1 && group && (
          <Fragment>
            <DialogHeader className="border-b border-border p-6 pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                <FolderPlus className="h-5 w-5 text-primary" />
                Crear nueva entidad en {group.name}
              </DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground">
                Elige qué tipo de contenido quieres añadir a este grupo.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              {/* Próximamente ------------------------------------------------ */}
              <div
                className="group relative flex cursor-not-allowed flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center opacity-60 bg-muted/10"
                onClick={() =>
                  toast({
                    title: "Próximamente",
                    description:
                      "La creación de subgrupos estará disponible pronto.",
                  })
                }
              >
                <FolderPlus className="mb-3 h-10 w-10 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  Space Group
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Organiza spaces relacionados.
                </p>
                <span className="absolute right-2 top-2 rounded-full bg-yellow-600/20 px-2 py-0.5 text-xs font-semibold text-yellow-300">
                  Pronto
                </span>
              </div>

              {/* Botón Space ------------------------------------------------- */}
              <button
                className="group flex flex-col items-center justify-center rounded-lg border border-border p-6 text-center transition-all hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => setStep(2)}
              >
                <FileText className="mb-3 h-10 w-10 text-primary transition-colors group-hover:text-primary/80" />
                <span className="font-semibold text-foreground">Space</span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Contiene Posts o Cursos.
                </p>
              </button>
            </div>

            <DialogFooter className="border-t border-border bg-muted/10 p-6 pt-4">
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

        {/* Paso 2 ---------------------------------------------------------- */}
        {step === 2 && group && (
          <Fragment>
            <DialogHeader className="border-b border-border p-6 pb-4">
              <DialogTitle className="text-xl font-bold text-foreground">
                Configura tu nuevo Space
              </DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground">
                Selecciona qué funcionalidades tendrá este space. Puedes elegir
                una o ambas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-6">
              <SpaceKindSelector
                id="POSTS"
                icon={FileText}
                title="Posts"
                description="Para compartir anuncios, noticias y actualizaciones."
                checked={spaceKinds.has("POSTS")}
                onCheckedChange={(c) => handleSpaceKindChange("POSTS", c)}
              />
              <SpaceKindSelector
                id="COURSES"
                icon={BookOpen}
                title="Cursos"
                description="Para organizar y gestionar contenido educativo."
                checked={spaceKinds.has("COURSES")}
                onCheckedChange={(c) => handleSpaceKindChange("COURSES", c)}
              />
            </div>

            <DialogFooter className="border-t border-border bg-muted/10 flex justify-between p-6 pt-4">
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
                        className="-ml-1 mr-2 h-4 w-4 animate-spin"
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