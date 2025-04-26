"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  backHref: string;
  title: string;
  description?: string | null;
  image?: string | null;
}

export default function CourseHeader({
  backHref,
  title,
  description,
  image,
}: Props) {
  return (
    <header className="mb-8">
      <Link
        href={backHref}
        className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span>Volver</span>
      </Link>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Cover */}
        <img
          src={image ?? "/images/placeholder.jpg"}
          alt={title}
          className="h-40 w-72 object-cover rounded-lg border border-border"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
      </div>
    </header>
  );
}
