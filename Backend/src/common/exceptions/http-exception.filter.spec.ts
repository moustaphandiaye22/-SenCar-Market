import type { ArgumentsHost} from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

import { DomainException } from './domain.exception';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const createHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status } as unknown;

    return {
      host: {
        switchToHttp: () => ({
          getResponse: () => response,
        }),
      } as ArgumentsHost,
      status,
      json,
    };
  };

  afterEach(() => {
    delete process.env.NODE_ENV;
    jest.restoreAllMocks();
  });

  it('formats domain exceptions with the custom payload', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = createHost();

    filter.catch(
      new DomainException('Erreur métier', 422, 'BUSINESS_RULE_FAILED'),
      host,
    );

    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith({
      statusCode: 422,
      message: 'Erreur métier',
      errorCode: 'BUSINESS_RULE_FAILED',
    });
  });

  it('passes through standard HTTP exceptions', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = createHost();
    const exception = new HttpException(
      { statusCode: HttpStatus.BAD_REQUEST, message: 'Bad request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Bad request',
    });
  });

  it('hides internal details in production', () => {
    process.env.NODE_ENV = 'production';
    const filter = new HttpExceptionFilter();
    const { host, status, json } = createHost();
    const logger = (filter as unknown as { logger: { error: jest.Mock } }).logger;
    jest.spyOn(logger, 'error').mockImplementation(() => undefined);

    filter.catch(new Error('Database down'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Erreur interne du serveur',
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('exposes debug details outside production', () => {
    process.env.NODE_ENV = 'development';
    const filter = new HttpExceptionFilter();
    const { host, json } = createHost();
    const logger = (filter as unknown as { logger: { error: jest.Mock } }).logger;
    jest.spyOn(logger, 'error').mockImplementation(() => undefined);

    filter.catch(new Error('Debug failure'), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Debug failure',
        errorName: 'Error',
      }),
    );
  });
});
