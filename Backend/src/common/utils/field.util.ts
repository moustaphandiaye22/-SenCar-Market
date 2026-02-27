import { HTTP_STATUS } from '../constants/http-status-codes';
import { DomainException } from '../exceptions/domain.exception';

export function normalizeRequiredField(value: string, field: string, errorCode: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new DomainException(`Champ requis invalide: ${field}`, HTTP_STATUS.BAD_REQUEST, errorCode);
  }
  return normalized;
}

export function normalizeOptionalField(value?: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized || undefined;
}
