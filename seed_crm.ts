import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './src/models/User';
import CrmContact from './src/models/CrmContact';
import CrmDeal from './src/models/CrmDeal';
import CrmActivity from './src/models/CrmActivity';
import CrmTask from './src/models/CrmTask';
import CrmNotification from './src/models/CrmNotification';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in environment variables.');
  process.exit(1);
}

// Sample Data Lists for generation
const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 'Robert', 'Karen', 'William', 'Nancy', 'Joseph', 'Lisa', 'Thomas', 'Betty', 'Charles', 'Margaret', 'Daniel', 'Sandra', 'Matthew', 'Ashley', 'Anthony', 'Dorothy', 'Mark', 'Kimberly', 'Donald', 'Emily', 'Steven', 'Donna', 'Paul', 'Michelle', 'Andrew', 'Carol', 'Joshua', 'Amanda', 'Kenneth', 'Melissa', 'Kevin', 'Deborah', 'Brian', 'Stephanie', 'Timothy', 'Rebecca', 'Ronald', 'Sharon', 'George', 'Laura', 'Jason', 'Cynthia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young', 'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Ramirez', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres'];
const companies = ['BioLabs Inc.', 'Zenith Diagnostics', 'Apex Medical Solutions', 'Nexus Pharmaceutics', 'Core Path Labs', 'Quantum BioTech', 'Prime Therapeutics', 'Holo Lifesciences', 'Delta Clinical Group', 'Veritas Medical Solutions', 'Omni Diagnostics', 'Stellar Research', 'Aura Genomics', 'TheraLife Systems', 'Sano Pathology', 'MedVantage Labs', 'Vanguard BioLabs', 'BlueSky Lifesciences', 'Nova Path Diagnostics', 'Precision Bio'];
const domains = ['biolabs.com', 'zenithdiag.com', 'apexmed.com', 'nexuspharma.org', 'corepathlabs.com', 'quantumbiotech.io', 'primetherapeutics.com', 'hololife.com', 'deltaclinical.net', 'veritasmed.com'];
const jobTitles = ['Laboratory Manager', 'Director of Research', 'Lead Pathologist', 'Purchasing Coordinator', 'Chief Scientific Officer', 'Quality Control Specialist', 'Clinical Operations Manager', 'Senior Biochemist', 'Procurement Specialist', 'Medical Director'];
const statuses = ['Lead', 'Opportunity', 'Customer', 'Inactive'];
const dealStages = ['Lead', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const sources = ['Website Inquiry', 'Contact Form', 'Cold Outreach', 'Referral', 'Trade Show', 'Product Page', 'Download Catalog'];
const activityTypes = ['Call', 'Email', 'Meeting', 'Note'];
const taskPriorities = ['Low', 'Medium', 'High'];

async function seed() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected.');

  // Check/Create User
  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    console.log('Seeding default admin user...');
    adminUser = await User.create({
      name: 'System Administrator',
      email: 'info@labzenix.com',
      username: 'admin',
      password: 'admin123', // Will be hashed by mongoose pre-save
      role: 'admin',
      permissions: ['blogs', 'products', 'categories', 'seo', 'inquiries', 'users', 'settings'],
      active: true,
    });
  }

  // Clear existing CRM data
  console.log('Clearing existing CRM data...');
  await CrmContact.deleteMany({});
  await CrmDeal.deleteMany({});
  await CrmActivity.deleteMany({});
  await CrmTask.deleteMany({});
  await CrmNotification.deleteMany({});
  console.log('Existing CRM data cleared.');

  const totalContacts = 10050; // Just over 10,000 items to guarantee size
  console.log(`Generating ${totalContacts} Contacts...`);

  // Batch insert contacts for high performance
  const batchSize = 2500;
  const contactIds: mongoose.Types.ObjectId[] = [];
  const allContactsData = [];

  for (let i = 1; i <= totalContacts; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${i}@${domain}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    allContactsData.push({
      _id: new mongoose.Types.ObjectId(),
      name: `${fn} ${ln}`,
      email,
      phone: `+1 (${Math.floor(Math.random() * 900) + 100}) 555-${Math.floor(Math.random() * 9000) + 1000}`,
      company: `${company} #${Math.floor(Math.random() * 50) + 1}`,
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      status,
      owner: adminUser._id,
      source: sources[Math.floor(Math.random() * sources.length)],
      notes: `Generated contact #${i} for system validation and performance scale testing.`,
      tags: ['SeedData', status],
    });
  }

  // Bulk Insert Contacts
  for (let i = 0; i < allContactsData.length; i += batchSize) {
    const batch = allContactsData.slice(i, i + batchSize);
    await CrmContact.insertMany(batch);
    batch.forEach(c => contactIds.push(c._id));
    console.log(`Progress: ${contactIds.length}/${totalContacts} contacts inserted.`);
  }

  console.log('Contacts seeded successfully.');

  // Generate Deals for ~1,500 contacts
  console.log('Generating CRM Deals...');
  const dealsData = [];
  const dealCount = 1500;
  for (let i = 0; i < dealCount; i++) {
    const contactId = contactIds[Math.floor(Math.random() * contactIds.length)];
    const stage = dealStages[Math.floor(Math.random() * dealStages.length)];
    const value = Math.floor(Math.random() * 85000) + 5000; // $5k - $90k
    
    dealsData.push({
      title: `Lab Instruments Deal #${i + 1}`,
      contact: contactId,
      value,
      stage,
      expectedCloseDate: new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000), // Next 60 days
      owner: adminUser._id,
    });
  }
  const seededDeals = await CrmDeal.insertMany(dealsData);
  console.log(`${seededDeals.length} Deals seeded successfully.`);

  // Generate Activities (Email logs, Call Logs, etc.) for ~3,000 contacts
  console.log('Generating CRM Activities...');
  const activitiesData = [];
  const activityCount = 4000;
  for (let i = 0; i < activityCount; i++) {
    const contactId = contactIds[Math.floor(Math.random() * contactIds.length)];
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    let subject = '';
    let description = '';
    let duration = undefined;
    let status = 'Completed';

    if (type === 'Call') {
      subject = 'Follow-up Call regarding Equipment';
      duration = Math.floor(Math.random() * 600) + 30; // 30s to 10m
      description = `Discussed specification matching and lead timelines. Call outcome: ${Math.random() > 0.3 ? 'Interested, send quote.' : 'Call back next week.'}`;
    } else if (type === 'Email') {
      subject = 'Specification Datasheet & Pricing Proposal';
      description = 'Sent product ranges brochure and updated pricing catalog matching core laboratory demands.';
      status = Math.random() > 0.4 ? 'Opened' : 'Sent';
    } else if (type === 'Meeting') {
      subject = 'Product Demo & Presentation';
      description = 'Completed visual demo of LabZenix Core Analyzer. Clients were highly receptive.';
    } else {
      subject = 'Note';
      description = 'Internal note: Client plans to scale operations in Q3/Q4. Monitor closely.';
    }

    activitiesData.push({
      contact: contactId,
      type,
      subject,
      description,
      duration,
      status,
      createdBy: adminUser._id,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Past 30 days
    });
  }
  
  // Bulk insert activities
  for (let i = 0; i < activitiesData.length; i += batchSize) {
    const batch = activitiesData.slice(i, i + batchSize);
    await CrmActivity.insertMany(batch);
  }
  console.log(`${activityCount} Activities seeded successfully.`);

  // Generate Tasks
  console.log('Generating CRM Tasks...');
  const tasksData = [];
  const taskCount = 1200;
  for (let i = 0; i < taskCount; i++) {
    const contactId = contactIds[Math.floor(Math.random() * contactIds.length)];
    const status = Math.random() > 0.35 ? 'Pending' : 'Completed';
    const priority = taskPriorities[Math.floor(Math.random() * taskPriorities.length)];
    const isOverdue = !status && Math.random() > 0.7;

    tasksData.push({
      title: `CRM Follow Up Task #${i + 1}`,
      description: 'Standard client communication followup to request lab configuration requirements.',
      dueDate: isOverdue 
        ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
      status: isOverdue ? 'Overdue' : status,
      priority,
      assignedTo: adminUser._id,
      contact: contactId,
    });
  }
  await CrmTask.insertMany(tasksData);
  console.log(`${taskCount} Tasks seeded successfully.`);

  // Generate Notifications
  console.log('Generating CRM System Notifications...');
  const notificationsData = [
    {
      userId: adminUser._id,
      title: 'New High Priority Lead',
      message: 'Lead "Sarah Jenkins" registered through the core spectrophotometer contact form.',
      type: 'LeadUpdate',
      read: false,
    },
    {
      userId: adminUser._id,
      title: 'Overdue Task Alert',
      message: 'Task "Follow Up Task #14" is 2 days overdue.',
      type: 'Task',
      read: false,
    },
    {
      userId: adminUser._id,
      title: 'Upcoming Call Scheduled',
      message: 'Call with Zenith Diagnostics scheduled for today at 2:00 PM.',
      type: 'CallSchedule',
      read: false,
    },
    {
      userId: adminUser._id,
      title: 'Deal Closed Won! 🎉',
      message: 'Apex Medical Solutions deal of $85,000 successfully transitioned to Closed Won.',
      type: 'DealWon',
      read: true,
    }
  ];
  await CrmNotification.insertMany(notificationsData);
  console.log('CRM notifications seeded.');

  console.log('Disconnecting...');
  await mongoose.disconnect();
  console.log('SUCCESS: CRM Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Seeding process encountered an error:', err);
  process.exit(1);
});
