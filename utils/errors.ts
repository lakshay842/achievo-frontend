import axios from 'axios';

export type AppError = {
  message: string;
  status?: number;
  offline: boolean;
};

function readDetailMessage(data: object): string | undefined {
  if (!('details' in data) || !Array.isArray(data.details) || !data.details[0]) {
    return undefined;
  }

  const first = data.details[0];
  if (first && typeof first === 'object' && 'message' in first && typeof first.message === 'string') {
    const message = first.message.trim();
    return message || undefined;
  }

  return undefined;
}

function readServerMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const detailMessage = readDetailMessage(data);
  const topMessage =
    'message' in data && typeof data.message === 'string' && data.message.trim()
      ? data.message.trim()
      : undefined;

  // Prefer field-level details over generic "Validation failed".
  if (detailMessage && (!topMessage || /^validation failed$/i.test(topMessage))) {
    return detailMessage;
  }

  if (topMessage) {
    return topMessage;
  }

  if ('error' in data && typeof data.error === 'string' && data.error.trim()) {
    return data.error.trim();
  }

  return detailMessage;
}

export function isAppError(error: unknown): error is AppError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      'offline' in error &&
      typeof error.offline === 'boolean',
  );
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return { message: 'The request timed out. Try again.', offline: false };
    }

    if (!error.response) {
      return {
        message: 'You appear to be offline. Check your connection and try again.',
        offline: true,
      };
    }

    const message = readServerMessage(error.response.data);
    return {
      message: message ?? 'The server could not complete that request.',
      status: error.response.status,
      offline: false,
    };
  }

  if (error instanceof Error && error.message) {
    return { message: error.message, offline: false };
  }

  return { message: 'Something went wrong. Try again.', offline: false };
}

export function getErrorMessage(error: unknown): string {
  return toAppError(error).message;
}
