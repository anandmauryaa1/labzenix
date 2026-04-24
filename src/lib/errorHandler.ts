import { NextResponse } from 'next/server';
import { logger } from './logger';

export function handleProductionError(error: any) {
  logger.error('API Error caught by production handler', { 
    name: error.name,
    message: error.message,
    code: error.code
  });

  // Mongoose Validation Error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return NextResponse.json({ 
      error: `Validation error: ${messages.join(', ')}`,
      fields: Object.keys(error.errors)
    }, { status: 400 });
  }

  // Mongoose Duplicate Key Error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return NextResponse.json({ 
      error: `A record with this ${field} already exists.` 
    }, { status: 409 });
  }

  // TypeErrors or other standard errors
  const message = error.message || 'An unexpected error occurred';
  
  return NextResponse.json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'An error occurred while processing your request' 
      : message 
  }, { status: 500 });
}
