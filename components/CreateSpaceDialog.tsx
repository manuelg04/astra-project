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

type CreationStep = 1 | 2;
type SpaceKind = "POSTS" | "COURSES";

interface Props {
  open: boolean;
  brandId: string;
  group: SpaceGroupSummary | null;
  onClose: () => void;
  onCreated: () => void; // disparar mutateBrandsTree
}

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

  const reset = () => {
    setStep(1);
    setSpaceKinds(new Set());
    onClose();
  };

  /* creación -------------------------------------------------------- */
  async function handleCreate() {
    if (spaceKinds.size === 0) {
      toast({
        variant: "destructive",
        title: "Selecciona al menos un tipo",
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast({ variant: "destructive", title: "No autenticado" });
      return;
    }

    try {
      if (spaceKinds.has("POSTS")) {
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
        if (!res.ok) throw new Error("Error al crear PostSpace");
      }

      /* cuando añadas CURSOS, haz la otra llamada aquí */

      toast({
        title: "¡Creado!",
        description: "El space se añadió correctamente.",
      });
      onCreated(); // refetch global
      reset();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Algo salió mal",
        description: (err as Error).message,
      });
    }
  }

  /* ----------------------------- UI ------------------------------- */
  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="sm:max-w-md">
        {step === 1 && group && (
          <Fragment>
            <DialogHeader>
              <DialogTitle>Crear nuevo</DialogTitle>
              <DialogDescription>
                Selecciona qué deseas crear dentro de{" "}
                <strong>{group.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    title: "Pendiente",
                    description:
                      "La creación de Space groups desde aquí llegará pronto.",
                  })
                }
              >
                Space&nbsp;group
              </Button>
              <Button variant="default" onClick={() => setStep(2)}>
                Space
              </Button>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={reset}>
                Cancelar
              </Button>
            </DialogFooter>
          </Fragment>
        )}

        {step === 2 && group && (
          <Fragment>
            <DialogHeader>
              <DialogTitle>Selecciona el tipo de Space</DialogTitle>
              <DialogDescription>
                Marca al menos un tipo. Por ahora: Posts y Cursos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-6">
              {[
                { key: "POSTS", label: "Posts" },
                { key: "COURSES", label: "Cursos" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={spaceKinds.has(key as SpaceKind)}
                    onCheckedChange={(checked) => {
                      const next = new Set(spaceKinds);
                      checked
                        ? next.add(key as SpaceKind)
                        : next.delete(key as SpaceKind);
                      setSpaceKinds(next);
                    }}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>

            <DialogFooter className="mt-8">
              <Button variant="ghost" onClick={reset}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Continuar</Button>
            </DialogFooter>
          </Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
}
