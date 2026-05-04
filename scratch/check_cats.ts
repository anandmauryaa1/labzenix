import mongoose from 'mongoose';
import Category from './src/models/Category.ts';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const cats = await Category.find({});
  console.log(JSON.stringify(cats, null, 2));
  process.exit(0);
}

check();
