import { ReactNode } from "react";
import { notFound } from "next/navigation";

export default async function BrandLayout({
  params,
  children,
}: {
  params: { brandId: string };
  children: ReactNode;
}) {
  // Ejemplo de validación de brand
  // const brand = await getBrandById(params.brandId);
  // if (!brand) notFound();

  return (
    <div className="flex w-full">
      {/* Aquí podrías renderizar un sub-sidebar con los Space Groups del brand */}
      {children}
    </div>
  );
}
