"use client";

export default function CursosPage({
  params,
}: {
  params: { brandId: string; groupId: string };
}) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Cursos · {params.groupId} ({params.brandId})
      </h1>
    </div>
  );
}
