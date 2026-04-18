import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('MONGODB_URI not defined');

let cached = (global as any).mongoose;

if (!cached) (global as any).mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables');
    throw new Error('MONGODB_URI not defined');
  }

  if (!cached.promise) {
    console.log('Attempting MongoDB connection...');
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(m => {
      console.log('MongoDB connection established successfully');
      return m;
    }).catch(err => {
      console.error('MongoDB connection failed:', err);
      cached.promise = null;
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

export default dbConnect;