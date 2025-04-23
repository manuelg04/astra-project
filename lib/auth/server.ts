import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

/**
 * Devuelve el userId extraído del JWT almacenado en la cookie "token".
 * Si la cookie falta o es inválida ⇒ null.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();           // ⬅️ ahora se espera
  const raw = cookieStore.get("token")?.value;
  if (!raw) return null;

  try {
    return verifyJWT(raw).sub;                   // verifyJWT es sincrónico
  } catch {
    return null;
  }
}