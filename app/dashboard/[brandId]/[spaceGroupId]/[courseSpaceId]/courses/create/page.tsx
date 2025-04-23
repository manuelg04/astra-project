"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Upload, AlertCircle } from "lucide-react";

interface Props {
  params: {
    brandId: string;
    spaceGroupId: string;
    courseSpaceId: string;
  };
}

export default function CreateCoursePage({ params }: Props) {
  const router = useRouter();
  const { brandId, spaceGroupId, courseSpaceId } = params;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!imageFile) {
      setError("Debes seleccionar una imagen de portada");
      return;
    }

    setSubmitting(true);
    try {
      // convertir imagen a data URL
      const dataUrl: string = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.onerror = () => rej("Error leyendo la imagen");
        reader.readAsDataURL(imageFile);
      });

      const token = getAuthToken();
      const resp = await fetch(
        `/api/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}/courses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ name, description, image: dataUrl }),
        },
      );

      if (!resp.ok) {
        const body = await resp.json();
        throw new Error(body.error || "Error creando el curso");
      }

      // redirigir de vuelta al listado
      router.push(`/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Link
            href={`/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}`}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Volver al listado</span>
          </Link>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
          <h1 className="text-3xl font-bold mb-2">Crear nuevo curso</h1>
          <p className="text-muted-foreground mb-8">
            Completa la información básica para crear tu curso
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Nombre del curso
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Introducción al diseño UX/UI"
                className="w-full bg-background border border-input rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Descripción del curso
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1500}
                rows={5}
                placeholder="Describe brevemente de qué trata este curso..."
                className="w-full bg-background border border-input rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <div className="flex justify-end">
                <span
                  className={`text-xs ${description.length > 1400 ? "text-amber-500" : "text-muted-foreground"}`}
                >
                  {description.length}/1500
                </span>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Imagen de portada
              </label>

              {preview ? (
                <div className="relative group">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-border"
                  />
                  <div
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg cursor-pointer"
                    onClick={() =>
                      document.getElementById("cover-image")?.click()
                    }
                  >
                    <span className="text-white font-medium">
                      Cambiar imagen
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() =>
                    document.getElementById("cover-image")?.click()
                  }
                  className="border-2 border-dashed border-border rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors"
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground font-medium">
                    Haz clic para subir una imagen
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG o GIF (Recomendado: 1280x720px)
                  </p>
                </div>
              )}

              <input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-4 flex items-start">
                <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-6 rounded-md disabled:opacity-50 transition-colors font-medium"
              >
                {submitting ? "Guardando..." : "Guardar y continuar"}
              </button>
              <Link
                href={`/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
