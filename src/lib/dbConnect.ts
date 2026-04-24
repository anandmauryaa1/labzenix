import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('MONGODB_URI not defined');

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached!.conn) return cached!.conn;

  if (!MONGODB_URI) {
    logger.error('CRITICAL: MONGODB_URI is not defined in environment variables');
    throw new Error('MONGODB_URI not defined');
  }

  if (!cached!.promise) {
    logger.info('Attempting MongoDB connection...');
    const opts = {
      bufferCommands: false,
    };
    cached!.promise = mongoose.connect(MONGODB_URI, opts).then(m => {
      logger.info('MongoDB connection established successfully');
      return m;
    }).catch(err => {
      logger.error('MongoDB connection failed', { error: err.message });
      cached!.promise = null;
      throw err;
    });
  }
  
  try {
    cached!.conn = await cached!.promise;
  } catch (e: any) {
    cached!.promise = null;
    throw e;
  }
  return cached!.conn;
}

export default dbConnect;