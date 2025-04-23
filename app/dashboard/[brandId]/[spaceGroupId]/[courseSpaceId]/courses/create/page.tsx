"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import Link from "next/link";

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
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-6">Crear nuevo curso</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción (max. 1500)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1500}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/1500
            </p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block text-sm text-gray-400"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 h-48 w-full object-cover rounded-md"
              />
            )}
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Botones */}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md disabled:opacity-50"
            >
              {submitting ? "Guardando..." : "Guardar y continuar"}
            </button>
            <Link
              href={`/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}`}
              className="text-gray-400 hover:text-gray-200"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
