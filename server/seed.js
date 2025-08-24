const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
const companies = [
  'TechCorp', 'InnovateLabs', 'DigitalSolutions', 'FutureTech', 'SmartSystems',
  'CloudWorks', 'DataFlow', 'NextGen', 'CyberTech', 'AISolutions',
  'WebCraft', 'MobileFirst', 'DevStudio', 'CodeWorks', 'TechHub'
];
const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte'
];
const states = [
  'NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'GA',
  'MI', 'NJ', 'VA', 'WA', 'OR', 'CO', 'TN', 'MA', 'IN', 'MN'
];

const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
  'James', 'Jennifer', 'William', 'Amanda', 'Richard', 'Jessica', 'Thomas',
  'Ashley', 'Christopher', 'Stephanie', 'Daniel', 'Nicole', 'Matthew', 'Elizabeth',
  'Anthony', 'Megan', 'Mark', 'Lauren', 'Donald', 'Rachel', 'Steven', 'Kayla'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen'
];

const generateRandomLead = (userId) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const score = Math.floor(Math.random() * 101);
  const leadValue = Math.floor(Math.random() * 10000) + 100;
  const isQualified = Math.random() > 0.7;
  
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
  const phone = `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const daysAgo = Math.floor(Math.random() * 365);
  const created_at = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const last_activity_at = Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * daysAgo) * 24 * 60 * 60 * 1000) : null;

  return {
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    company,
    city,
    state,
    source,
    status,
    score,
    lead_value: leadValue,
    last_activity_at,
    is_qualified: isQualified,
    createdAt: created_at,
    updatedAt: created_at
  };
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    const hashedPassword = await bcrypt.hash('test123', 12);
    
    const user = new User({
      email: 'test@example.com',
      password: hashedPassword,
      first_name: 'Test',
      last_name: 'User'
    });
    
    await user.save();
    console.log(`Created test user with ID: ${user._id}`);

    const leads = [];
    for (let i = 0; i < 120; i++) {
      leads.push(generateRandomLead(user._id));
    }

    await Lead.insertMany(leads);

    console.log(`Created ${leads.length} test leads`);
    console.log('Database seeding completed successfully!');
    console.log('Test user credentials:');
    console.log('Email: test@example.com');
    console.log('Password: test123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
