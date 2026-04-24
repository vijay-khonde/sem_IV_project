import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Report from './models/Report.js';

dotenv.config();

const numReports = 100;

// Coordinates around a central point (e.g., Pune/Mumbai area)
const baseLat = 18.5204;
const baseLng = 73.8567;

const generateRandomCoord = (base, variance = 0.05) => {
  return base + (Math.random() - 0.5) * variance;
};

const authorities = [
  { name: 'Gov Authority', email: 'gov@carenet.local', role: 'gov', trustScore: 100 },
  { name: 'NGO Partner', email: 'ngo@carenet.local', role: 'ngo', trustScore: 90 },
  { name: 'Healthcare Dept', email: 'healthcare@carenet.local', role: 'healthcare', trustScore: 95 },
  { name: 'Citizen Reporter', email: 'citizen@carenet.local', role: 'user', trustScore: 50 },
];

const reportTemplates = [
  { title: 'Suspicious gathering near park', category: 'suspicious_activity', tags: ['group_activity'], status: 'pending' },
  { title: 'Found alcohol bottles in school yard', category: 'alcohol_abuse', tags: ['repeat_offense', 'minors_involved'], status: 'verified' },
  { title: 'Potential substance use behind school', category: 'drug_abuse', tags: ['minors_involved'], status: 'verified' },
  { title: 'Aggressive behavior and suspected intoxication', category: 'suspicious_activity', tags: ['weapons_involved'], status: 'pending' },
  { title: 'Medical emergency: suspected overdose', category: 'drug_abuse', tags: ['overdose_risk'], status: 'resolved' },
];

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected');

    // Clear old data (optional, but let's clear reports and non-admin users to avoid duplicates)
    console.log('Clearing old mock data...');
    await Report.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });

    console.log('Creating mock authority and citizen accounts...');
    const hashedPass = await bcrypt.hash('Password@123', 12);
    
    const createdUsers = [];
    for (const auth of authorities) {
      const user = await User.create({
        name: auth.name,
        email: auth.email,
        password: hashedPass,
        role: auth.role,
        trustScore: auth.trustScore
      });
      createdUsers.push(user);
    }

    console.log(`✅ Created ${createdUsers.length} users.`);

    console.log(`Generating ${numReports} mock reports...`);
    const reports = [];

    for (let i = 0; i < numReports; i++) {
      // Pick random user
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      // Pick random template
      const template = reportTemplates[Math.floor(Math.random() * reportTemplates.length)];

      const lng = generateRandomCoord(baseLng, 0.2); // roughly 20km spread
      const lat = generateRandomCoord(baseLat, 0.2);

      // Randomize status based on role
      let status = template.status;
      if (user.role !== 'user' && Math.random() > 0.5) {
        status = 'verified';
      }

      const riskScore = Math.floor(Math.random() * 10) + 1;
      
      reports.push({
        userId: user._id,
        title: `${template.title} #${i+1}`,
        description: `This is a randomly generated report based on community and authority data representing ${template.category}. It highlights observed activities and concerns in the specified area. Needs attention.`,
        category: template.category,
        severityTags: template.tags,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        address: `Approximate Location ${i+1}, District Area`,
        isAnonymous: Math.random() > 0.7,
        status: status,
        riskScore: riskScore,
        credibility: user.trustScore / 100
      });
    }

    await Report.insertMany(reports);
    console.log(`✅ Successfully seeded ${numReports} reports from Gov, Healthcare, NGO, and Community.`);
    console.log('Data generation complete.');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
