export function toNumberOrZero(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function toNullableNumber(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === 'object' && value && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber() as number;
  }
  return null;
}

export function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
}
