import { resolveDomainError } from '../constants/domain-errors';

export class DomainException extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;

  constructor(
    messageOrErrorCode: string,
    statusCode?: number,
    errorCode?: string,
  ) {
    const resolvedErrorCode = errorCode;
    const { message, statusCode: resolvedStatusCode } = resolveDomainError(
      resolvedErrorCode,
      messageOrErrorCode,
      statusCode,
    );
    super(message);
    this.statusCode = resolvedStatusCode;
    this.errorCode = resolvedErrorCode;
    this.name = 'DomainException';
  }
}
