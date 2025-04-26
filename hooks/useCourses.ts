/* helpers para cursos / capítulos -------------------------------------- */
import { getAuthToken } from "@/lib/auth";

export interface ChapterFromApi {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}

/* ——— agregar capítulo ——— */
export async function addChapter(
  brandId: string,
  spaceGroupId: string,
  courseSpaceId: string,
  courseId: string,
  payload: { title: string },
): Promise<ChapterFromApi> {
  const token = getAuthToken();
  if (!token) throw new Error("Unauthenticated");

  const url = `/api/dashboard/${brandId}/${spaceGroupId}/course-spaces/${courseSpaceId}/courses/${courseId}/chapters`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to add chapter");
  }
  return res.json();
}
