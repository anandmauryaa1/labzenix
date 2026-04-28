import { NextResponse } from 'next/server';
import { logger } from './logger';

/** Minimal shape we expect from Mongoose / Node errors */
interface KnownError {
  name?: string;
  message?: string;
  code?: number | string;
  keyPattern?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

function asKnownError(error: unknown): KnownError {
  return error as KnownError;
}

export function handleProductionError(error: unknown) {
  const e = asKnownError(error);

  logger.error('API Error caught by production handler', {
    name: String(e.name ?? ''),
    message: String(e.message ?? ''),
    code: String(e.code ?? ''),
  });

  // Mongoose Validation Error
  if (e.name === 'ValidationError' && e.errors) {
    const messages = Object.values(e.errors).map((err) => err.message);
    return NextResponse.json(
      {
        error: `Validation error: ${messages.join(', ')}`,
        fields: Object.keys(e.errors),
      },
      { status: 400 }
    );
  }

  // Mongoose Duplicate Key Error
  if (e.code === 11000 && e.keyPattern) {
    const field = Object.keys(e.keyPattern)[0];
    return NextResponse.json(
      { error: `A record with this ${field} already exists.` },
      { status: 409 }
    );
  }

  // TypeErrors or other standard errors
  const message = e.message || 'An unexpected error occurred';

  return NextResponse.json(
    {
      error:
        process.env.NODE_ENV === 'production'
          ? 'An error occurred while processing your request'
          : message,
    },
    { status: 500 }
  );
}
