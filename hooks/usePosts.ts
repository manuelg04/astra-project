/* lib/hooks/usePosts.ts -------------------------------------------------- */
import useSWR, { mutate as globalMutate } from "swr";
import { getAuthToken } from "@/lib/auth";

export interface PostFromApi {
  id: string;
  title: string | null;
  message: string;
  isPinned: boolean;
  likesCount: number;
  liked: boolean; // ← backend debe devolverlo
  createdAt: string;
  creator: {
    // ← select en tu API
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

const fetcher = async (url: string) => {
  const token = getAuthToken();
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  const { data } = (await res.json()) as { data: PostFromApi[] };
  return data;
};

export function usePosts(
  brandId: string,
  spaceGroupId: string,
  postSpaceId: string,
) {
  const key = `/api/dashboard/${brandId}/${spaceGroupId}/post-spaces/${postSpaceId}/posts`;
  const { data, error, isLoading, mutate } = useSWR<PostFromApi[]>(
    key,
    fetcher,
  );
  return { posts: data ?? [], error, isLoading, mutate };
}

/* ————— helper: crear post ————— */
export async function createPost(
  brandId: string,
  spaceGroupId: string,
  postSpaceId: string,
  payload: { title?: string; message: string },
) {
  const token = getAuthToken();
  if (!token) throw new Error("Unauthenticated");

  const url = `/api/dashboard/${brandId}/${spaceGroupId}/post-spaces/${postSpaceId}/posts`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create post");
  const post = await res.json();
  /* revalida globalmente el key */
  globalMutate(url);
  return post;
}

/* ——— helper: toggle like ———
   Nueva signatura que recibe las 4 IDs para formar la ruta exacta
————————————————————————————————— */
export async function toggleLike(
  brandId: string,
  spaceGroupId: string,
  postSpaceId: string,
  postId: string,
) {
  const token = getAuthToken();
  if (!token) throw new Error("Unauthenticated");

  const url = `/api/dashboard/${brandId}/${spaceGroupId}/post-spaces/${postSpaceId}/posts/${postId}/likes`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to toggle like");
  const json = (await res.json()) as {
    liked: boolean;
    likesCount: number;
  };
  return json;
}

/* ——— helper: pin / unpin ——— */
export async function pinPost(
  brandId: string,
  spaceGroupId: string,
  postSpaceId: string,
  postId: string,
) {
  const token = getAuthToken();
  if (!token) throw new Error("Unauthenticated");

  const url = `/api/dashboard/${brandId}/${spaceGroupId}/post-spaces/${postSpaceId}/posts/${postId}/pin`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to pin/unpin post");
  return res.json();
}

/* ——— helper: delete post ——— */
export async function deletePost(
  brandId: string,
  spaceGroupId: string,
  postSpaceId: string,
  postId: string,
) {
  const token = getAuthToken();
  if (!token) throw new Error("Unauthenticated");

  const url = `/api/dashboard/${brandId}/${spaceGroupId}/post-spaces/${postSpaceId}/posts/${postId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete post");
  return res.json();
}

/* ——— helper: update post (placeholder, por si lo usas en el modal) —— */
export async function updatePost(
  brandId: string,
  spaceGroupId: string,
  postSpaceId: string,
  postId: string,
  payload: { title?: string | null; message?: string | null },
) {
  const token = getAuthToken();
  if (!token) throw new Error("Unauthenticated");

  const url = `/api/dashboard/${brandId}/${spaceGroupId}/post-spaces/${postSpaceId}/posts/${postId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update post");
  return res.json();
}