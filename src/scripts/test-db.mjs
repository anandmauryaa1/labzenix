import mongoose from 'mongoose';

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in the environment.');
    console.log('💡 Tip: Ensure you run this with --env-file=.env.local');
    process.exit(1);
  }

  console.log('🔍 Attempting to connect to MongoDB...');
  console.log(`📡 URI: ${uri}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ SUCCESS: Connected to MongoDB successfully.');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections:`, collections.map(c => c.name).join(', '));
    
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('❌ CONNECTION FAILED:');
    console.error(err.message);
    process.exit(1);
  }
}

testConnection();
