import { Request } from "express";

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

/** Parse ?page & ?pageSize from a request, clamped to sane bounds. */
export function parsePagination(req: Request): PaginationParams {
  const rawPage = Number(req.query.page);
  const rawSize = Number(req.query.pageSize);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize =
    Number.isInteger(rawSize) && rawSize > 0
      ? Math.min(rawSize, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPaginationMeta(
  total: number,
  { page, pageSize }: PaginationParams
): PaginationMeta {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Case-insensitive search across the text fields shared by blogs and projects.
 * Returns an empty object when no query is given, so it can be spread into a
 * Prisma `where` unconditionally.
 */
export function buildSearchFilter(query: unknown) {
  const q = typeof query === "string" ? query.trim() : "";
  if (!q) return {};

  const contains = { contains: q, mode: "insensitive" as const };
  return {
    OR: [
      { title: contains },
      { short_description: contains },
      { description: contains },
    ],
  };
}
