import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies(); // ⬅️ ahora se espera
  const raw = cookieStore.get("token")?.value;
  if (!raw) return null;

  try {
    return verifyJWT(raw).sub; // verifyJWT es sincrónico
  } catch {
    return null;
  }
}
