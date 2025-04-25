"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { addChapter, ChapterFromApi } from "@/hooks/useCourses";

const schema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(120),
});

interface Props {
  brandId: string;
  spaceGroupId: string;
  courseSpaceId: string;
  courseId: string;
  onCreated: (chapter: ChapterFromApi) => void;
}

export default function AddChapterModal(props: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsed = schema.safeParse({ title });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const chapter = await addChapter(
        props.brandId,
        props.spaceGroupId,
        props.courseSpaceId,
        props.courseId,
        { title: parsed.data.title.trim() },
      );
      props.onCreated(chapter);     // ← notificar al padre
      setOpen(false);
      setTitle("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Agregar capítulo</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo capítulo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Título del capítulo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando…" : "Agregar capítulo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}