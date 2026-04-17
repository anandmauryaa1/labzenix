import mongoose from 'mongoose';
import Inquiry from '../models/Inquiry.js'; // Using .js for ESM if needed, but we'll try without first or use the ts file

// Since we are running in Node, we need to handle TS or just use the compiled path
// Better: just use a direct mongoose model definition for the test

const testSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const TestInquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', testSchema);

async function runTest() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  
  console.log('Inserting test inquiry...');
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    subject: 'Test Subject',
    message: 'Test Message'
  };
  
  const created = await TestInquiry.create(testData);
  console.log('Created:', created);
  
  const fetched = await TestInquiry.findById(created._id);
  console.log('Fetched Phone:', fetched.phone);
  
  await mongoose.disconnect();
}

runTest();
