import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/server";

/**
 * Impide re-ingresar al onboarding si el usuario ya tiene Brand.
 * Se aplica sólo al segmento /dashboard/getting-started
 */
export default async function GettingStartedGuardLayout({
  children,
}: {
  children: ReactNode;
}) {
  /* 1 · Autenticación (middleware global ya exige token) */
  const userId = await getCurrentUserId(); // ⬅️ await
  if (!userId) {
    redirect("/auth");
  }

  /* 2 · ¿Existe ya una Brand? */
  const exists = await prisma.brand.findFirst({
    where: { creatorId: userId },
    select: { id: true },
  });

  if (exists) {
    redirect("/dashboard"); // o `/dashboard/${exists.id}`
  }

  /* 3 · Mostrar wizard porque aún no tiene Brand */
  return <>{children}</>;
}
