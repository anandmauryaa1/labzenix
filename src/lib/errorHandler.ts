import { NextResponse } from 'next/server';

export function handleProductionError(error: any) {
  console.error('System Error:', error);

  // Mongoose Validation Error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return NextResponse.json({ 
      error: `Validation Failure: ${messages.join(', ')}`,
      fields: Object.keys(error.errors)
    }, { status: 400 });
  }

  // Mongoose Duplicate Key Error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return NextResponse.json({ 
      error: `Conflict Detected: An entry with this ${field} already exists in the catalog.` 
    }, { status: 409 });
  }

  // TypeErrors or other standard errors
  const message = error.message || 'An unexpected internal protocol error occurred';
  
  return NextResponse.json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal System Error: Protocol Interrupted' 
      : message 
  }, { status: 500 });
}
