import { AxiosError } from 'axios';

export interface AppError {
  code: string;
  message: string;
  details?: string;
  statusCode?: number;
  timestamp: string;
  recoverable: boolean;
}

export type ErrorHandler = (error: AppError) => void;

class ErrorService {
  private handlers: Set<ErrorHandler> = new Set();
  private errorLog: AppError[] = [];
  private maxLogSize = 50;

  subscribe(handler: ErrorHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private notify(error: AppError): void {
    this.handlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        console.error('Error handler failed:', e);
      }
    });
  }

  private logError(error: AppError): void {
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }
  }

  parseError(error: unknown): AppError {
    const timestamp = new Date().toISOString();

    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const serverMessage = error.response?.data?.message || error.response?.data?.error;
      
      let code = 'NETWORK_ERROR';
      let message = 'A network error occurred';
      let recoverable = true;

      if (!error.response) {
        code = 'NETWORK_OFFLINE';
        message = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        switch (statusCode) {
          case 400:
            code = 'BAD_REQUEST';
            message = serverMessage || 'Invalid request. Please check your input.';
            break;
          case 401:
            code = 'UNAUTHORIZED';
            message = 'Your session has expired. Please log in again.';
            recoverable = false;
            break;
          case 403:
            code = 'FORBIDDEN';
            message = 'You do not have permission to perform this action.';
            break;
          case 404:
            code = 'NOT_FOUND';
            message = serverMessage || 'The requested resource was not found.';
            break;
          case 409:
            code = 'CONFLICT';
            message = serverMessage || 'A conflict occurred. Please refresh and try again.';
            break;
          case 422:
            code = 'VALIDATION_ERROR';
            message = serverMessage || 'Validation failed. Please check your input.';
            break;
          case 429:
            code = 'RATE_LIMITED';
            message = 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
            code = 'SERVER_ERROR';
            message = 'An internal server error occurred. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            code = 'SERVICE_UNAVAILABLE';
            message = 'The service is temporarily unavailable. Please try again later.';
            break;
          default:
            code = `HTTP_${statusCode}`;
            message = serverMessage || 'An unexpected error occurred.';
        }
      }

      return {
        code,
        message,
        details: error.message,
        statusCode,
        timestamp,
        recoverable
      };
    }

    if (error instanceof Error) {
      return {
        code: 'APP_ERROR',
        message: error.message || 'An unexpected error occurred.',
        details: error.stack,
        timestamp,
        recoverable: true
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error) || 'An unknown error occurred.',
      timestamp,
      recoverable: true
    };
  }

  handle(error: unknown, silent = false): AppError {
    const appError = this.parseError(error);
    this.logError(appError);
    
    if (!silent) {
      this.notify(appError);
    }

    return appError;
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  isNetworkError(error: AppError): boolean {
    return ['NETWORK_ERROR', 'NETWORK_OFFLINE', 'SERVICE_UNAVAILABLE'].includes(error.code);
  }

  isAuthError(error: AppError): boolean {
    return ['UNAUTHORIZED', 'FORBIDDEN'].includes(error.code);
  }

  getUserFriendlyMessage(error: AppError): string {
    return error.message;
  }
}

const errorService = new ErrorService();
export default errorService;
