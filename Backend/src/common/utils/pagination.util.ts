import type { PaginatedResponseDto } from '../dto/paginated-response.dto';

export function clampPage(page: number): number {
  return page < 0 ? 0 : page;
}

export function clampSize(size: number, fallback: number, max = 100): number {
  if (size <= 0) {
    return fallback;
  }

  return Math.min(size, max);
}

export function buildPaginatedResponse<T>(
  content: T[],
  page: number,
  size: number,
  totalElements: number,
): PaginatedResponseDto<T> {
  const totalPages = Math.ceil(totalElements / size);

  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}
