// lib/hooks/useBrandsTree.ts
"use client";

import useSWR, { mutate as globalMutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { getAuthToken } from "@/lib/auth";

/* ——— tipos idénticos al endpoint /api/brands/tree ——— */
export interface CourseSpaceSummary {
  id: string;
  title: string;
  coursesCount: number;
}

export interface SpaceGroupSummary {
  id: string;
  name: string;
  emoji: string | null;
  isPublic: boolean;
  color: string | null;
  pricingType: "FREE" | "PAID";
  price: string;
  courseSpaces: CourseSpaceSummary[];
}

export interface BrandSummary {
  id: string;
  name: string;
  logoUrl: string | null;
  spaceGroups: SpaceGroupSummary[];
}
/* ———————————————————————————————————————————————— */

export function useBrandsTree() {
  const token = getAuthToken();
  return useSWR<{ brands: BrandSummary[] }>(
    token ? ["/api/brands/tree", token] : null,
    fetcher,
    { keepPreviousData: true },
  );
}

/** Fuerza refetch global desde cualquier parte */
export function mutateBrandsTree() {
  const token = getAuthToken();
  if (token) globalMutate(["/api/brands/tree", token]);
}
