import { HTTP_STATUS } from '../constants/http-status-codes';
import { DomainException } from '../exceptions/domain.exception';

export function requireNonBlank(value: string | undefined, message: string, code: string): string {
  const cleaned = value?.trim();
  if (!cleaned) {
    throw new DomainException(message, HTTP_STATUS.BAD_REQUEST, code);
  }

  return cleaned;
}
