import { queryOptions } from "@tanstack/react-query";

import { getCatalog, getMerchantDirectory, type DbCatalogItem } from "@/lib/catalog.functions";

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
  staleTime: 5 * 60 * 1000,
});

export const merchantDirectoryQuery = queryOptions({
  queryKey: ["merchant-directory"],
  queryFn: () => getMerchantDirectory(),
  staleTime: 5 * 60 * 1000,
});

export const byCategory = (items: DbCatalogItem[], slug: string) =>
  items.filter((i) => i.category === slug);

export const findItem = (items: DbCatalogItem[], id: string) => items.find((i) => i.id === id);

export const relatedItems = (items: DbCatalogItem[], item: DbCatalogItem, count = 4) =>
  byCategory(items, item.category)
    .filter((i) => i.id !== item.id)
    .slice(0, count);

export type { DbCatalogItem };
