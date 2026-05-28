import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CoreValue from './src/models/CoreValue';

// Load env vars if needed
dotenv.config({ path: '.env.local' });

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('No MONGODB_URI found');
    return;
  }
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const count = await CoreValue.countDocuments();
  if (count === 0) {
    await CoreValue.insertMany([
      { 
        title: 'Trusted for Excellence', 
        description: 'Certified with ISO 9001:2015 and CE standards, ensuring unmatched reliability and world-class standards.',
        icon: 'ShieldCheck',
        order: 1
      },
      { 
        title: 'Affordable Innovation', 
        description: 'Utilizing cutting-edge tools and an expert workforce to manufacture top-tier products that fit your budget.',
        icon: 'Zap',
        order: 2
      },
      { 
        title: 'Repeatable Precision', 
        description: 'Technologically advanced instruments deliver fully precise and consistent results, ensuring guaranteed reliability.',
        icon: 'Repeat',
        order: 3
      },
      { 
        title: 'Global Delivery', 
        description: 'Serving laboratory testing needs worldwide with exceptional craftsmanship and customer support.',
        icon: 'Globe',
        order: 4
      }
    ]);
    console.log('Seeded Core Values');
  } else {
    console.log('Core Values already exist, skipping seed.');
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
