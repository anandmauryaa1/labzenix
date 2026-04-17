import mongoose from 'mongoose';

async function checkData() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  
  const inquiries = await mongoose.connection.db.collection('inquiries').find({}).toArray();
  console.log('--- ALL INQUIRIES ---');
  inquiries.forEach(i => {
    console.log(`ID: ${i._id}, Name: ${i.name}, Phone: ${i.phone}`);
  });
  
  await mongoose.disconnect();
}

checkData();
