import type { PaginatedResponseDto } from '../dto/paginated-response.dto';

import { buildPaginatedResponse } from './pagination.util';

/**
 * Parsed pagination parameters with safe defaults
 */
export interface ParsedPagination {
  page: number;
  size: number;
}

/**
 * Options for parsing pagination parameters
 */
export interface PaginationOptions {
  defaultPage?: number;
  defaultSize?: number;
  maxSize?: number;
}

const DEFAULT_PAGINATION_OPTIONS: Required<PaginationOptions> = {
  defaultPage: 0,
  defaultSize: 20,
  maxSize: 100,
};

/**
 * Parse and validate pagination parameters with sensible defaults
 * Combines clampPage and clampSize into a single utility
 *
 * @example
 * const { page, size } = parsePaginationParams(page, size);
 * const { page, size } = parsePaginationParams(page, size, { defaultSize: 50, maxSize: 200 });
 */
export function parsePaginationParams(
  page?: number | null,
  size?: number | null,
  options: PaginationOptions = {},
): ParsedPagination {
  const { defaultPage, defaultSize, maxSize } = {
    ...DEFAULT_PAGINATION_OPTIONS,
    ...options,
  };

  const safePage = page == null ? defaultPage : Math.max(0, page);
  const safeSize = size == null ? defaultSize : Math.max(1, Math.min(size, maxSize));

  return { page: safePage, size: safeSize };
}

/**
 * Build a paginated response using the common pagination utility
 *
 * @example
 * const response = buildPagedResponse(items, page, size, total);
 */
export function buildPaged<T>(
  content: T[],
  page: number,
  size: number,
  total: number,
): PaginatedResponseDto<T> {
  return buildPaginatedResponse(content, page, size, total);
}

/**
 * Extract skip/take for Prisma queries
 *
 * @example
 * const { skip, take } = getPrismaPagination(page, size);
 */
export function getPrismaPagination(page: number, size: number): { skip: number; take: number } {
  return {
    skip: page * size,
    take: size,
  };
}
