import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

import { HTTP_STATUS } from "../constants/http-status-codes";

import { DomainException } from "./domain.exception";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof DomainException) {
      response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        message: exception.message,
        errorCode: exception.errorCode ?? null,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      response.status(status).json(payload);
      return;
    }

    // Log full error details for debugging
    const error = exception as Error;
    this.logger.error("Exception non gérée", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Erreur interne du serveur",
    });
  }
}
