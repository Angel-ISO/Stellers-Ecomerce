import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';


@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = undefined;

    // Log the full error for debugging
    console.error('🔥 Exception caught:', exception);
    if (exception instanceof Error) {
      console.error('Stack trace:', exception.stack);
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // If it's an object, use it directly
        response.status(status).json({
          ...exceptionResponse,
          timestamp: new Date().toISOString(),
        });
        return;
      } else {
        message = exception.message;
        error = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      status = HttpStatus.BAD_REQUEST;
      error = process.env.NODE_ENV === 'development' ? exception.stack : undefined;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}