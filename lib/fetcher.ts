export async function fetcher<T>([url, token]: [string, string]): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Request failed – ${res.status}`);
  }

  return (await res.json()) as T;
}
