import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // Message can be a string or object - normalize to always be an object
    const messageText =
      typeof message === 'string'
        ? message
        : (message as { message?: string })?.message;

    const messageObj =
      typeof message === 'object' ? (message as Record<string, unknown>) : {};

    const normalizedMessage = {
      ...messageObj,
      message: messageText || 'Internal server error',
    };

    response.status(status).json({
      statusCode: status,
      ...normalizedMessage,
    });
  }
}
