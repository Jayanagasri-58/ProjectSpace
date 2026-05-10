const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://meghanachitikila_db_user:dZVPIHyJH21Tk8oJ@cluster0.ky91fg2.mongodb.net/CampusConnect?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const users = [
  // Admin
  { id: 'a1', name: 'Dr. Vikram Singh', email: 'admin@college.edu', password: 'password123', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=vikram', details: 'Head of Administration' },

  // Faculty
  { id: 'f1', name: 'Prof. Anjali Verma', email: 'faculty@college.edu', password: 'password123', role: 'Faculty', avatar: 'https://i.pravatar.cc/150?u=anjali', details: 'Proctor - CSE 3rd Year' },
  { id: 'f2', name: 'Dr. Ramesh Kumar', email: 'ramesh@college.edu', password: 'password123', role: 'Faculty', avatar: 'https://i.pravatar.cc/150?u=ramesh', details: 'HOD - Electronics & Communication' },
  { id: 'f3', name: 'Prof. Sunita Rao', email: 'sunita@college.edu', password: 'password123', role: 'Faculty', avatar: 'https://i.pravatar.cc/150?u=sunita', details: 'Assistant Professor - Mathematics' },

  // Students
  { id: 's1', name: 'Rohit Sharma', email: 'student@college.edu', password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=rohit', details: 'B.Tech CSE - 3rd Year' },
  { id: 's2', name: 'Priya Patel', email: 'priya@college.edu', password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=priya', details: 'B.Tech CSE - 2nd Year' },
  { id: 's3', name: 'Arjun Mehta', email: 'arjun@college.edu', password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=arjun', details: 'B.Tech ECE - 3rd Year' },
  { id: 's4', name: 'Sneha Reddy', email: 'sneha@college.edu', password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=sneha', details: 'B.Tech CSE - 4th Year' },
  { id: 's5', name: 'Karan Joshi', email: 'karan@college.edu', password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=karan', details: 'B.Tech Mech - 2nd Year' },
];

async function seed() {
  let attempts = 0;
  while (attempts < 3) {
    try {
      console.log(`Attempt ${attempts + 1}: Connecting to MongoDB...`);
      await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 15000 });
      console.log('Connected!');

      // Drop collection and recreate to clear stale indexes
      try { await mongoose.connection.db.collection('users').drop(); } catch(e) {}
      // Recreate fresh collection
      await mongoose.connection.db.createCollection('users');
      console.log('Cleared old users and indexes.');

      // Insert all users directly (no model, no index enforcement)
      const result = await mongoose.connection.db.collection('users').insertMany(users);
      console.log(`✅ Successfully inserted ${result.insertedCount} users into MongoDB!`);
      console.log('');
      console.log('--- Account Details ---');
      users.forEach(u => console.log(`[${u.role}] ${u.name} | ${u.email} | ${u.password}`));

      await mongoose.disconnect();
      return;
    } catch (err) {
      attempts++;
      console.log(`Failed (${attempts}): ${err.message}`);
      if (attempts < 3) {
        console.log('Retrying in 10 seconds...');
        await new Promise(r => setTimeout(r, 10000));
      }
    }
  }
  console.log('❌ All attempts failed. Check your network connection.');
}

seed();
