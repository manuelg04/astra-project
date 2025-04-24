import { prisma } from "@/lib/db";

/**
 * Devuelve TRUE si el usuario es owner de la brand o admin de la brand.
 */
export async function isBrandAdmin(
  userId: string,
  brandId: string,
): Promise<boolean> {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { creatorId: true },
  });
  if (!brand) return false;

  if (brand.creatorId === userId) return true;

  const admin = await prisma.brandMember.findFirst({
    where: { brandId, userId, role: "ADMIN" },
    select: { id: true },
  });
  return !!admin;
}

/**
 * Devuelve TRUE si el usuario es AUTHOR (o superior, por ser admin de brand)
 * dentro del space group indicado.
 */
export async function canCreatePost(
  userId: string,
  brandId: string,
  spaceGroupId: string,
): Promise<boolean> {
  // Primero, si es admin de brand, tiene permiso implícito
  if (await isBrandAdmin(userId, brandId)) return true;

  // Segundo, verificar rol AUTHOR en SpaceGroupMember
  const member = await prisma.spaceGroupMember.findFirst({
    where: { userId, spaceGroupId, role: "AUTHOR" },
    select: { id: true },
  });
  return !!member;
}

/**
 * Devuelve TRUE si el usuario pertenece al space group
 * (FAN, AUTHOR o ADMIN de brand) —necesario para leer el contenido—.
 */
export async function isMemberOrPublic(
  userId: string | null,
  brandId: string,
  spaceGroupId: string,
): Promise<boolean> {
  const group = await prisma.spaceGroup.findUnique({
    where: { id: spaceGroupId },
    select: { isPublic: true },
  });
  if (!group) return false;
  if (group.isPublic) return true;
  if (!userId) return false;

  const member = await prisma.spaceGroupMember.findFirst({
    where: { userId, spaceGroupId },
    select: { id: true },
  });
  return !!member || (await isBrandAdmin(userId, brandId));
}
