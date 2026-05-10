const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://meghanachitikila_db_user:dZVPIHyJH21Tk8oJ@cluster0.ky91fg2.mongodb.net/CampusConnect?retryWrites=true&w=majority";

// All users with plain-text passwords → will be hashed
const users = [
  { id: 'a1', name: 'Dr. Vikram Singh',   email: 'admin@college.edu',   password: 'password123', role: 'Admin',   avatar: 'https://i.pravatar.cc/150?u=vikram',  details: 'Head of Administration' },
  { id: 'f1', name: 'Prof. Anjali Verma', email: 'faculty@college.edu', password: 'password123', role: 'Faculty', avatar: 'https://i.pravatar.cc/150?u=anjali',  details: 'Proctor - CSE 3rd Year' },
  { id: 'f2', name: 'Dr. Ramesh Kumar',   email: 'ramesh@college.edu',  password: 'password123', role: 'Faculty', avatar: 'https://i.pravatar.cc/150?u=ramesh',  details: 'HOD - Electronics & Communication' },
  { id: 'f3', name: 'Prof. Sunita Rao',   email: 'sunita@college.edu',  password: 'password123', role: 'Faculty', avatar: 'https://i.pravatar.cc/150?u=sunita',  details: 'Assistant Professor - Mathematics' },
  { id: 's1', name: 'Rohit Sharma',       email: 'student@college.edu', password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=rohit',   details: 'B.Tech CSE - 3rd Year' },
  { id: 's2', name: 'Priya Patel',        email: 'priya@college.edu',   password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=priya',   details: 'B.Tech CSE - 2nd Year' },
  { id: 's3', name: 'Arjun Mehta',        email: 'arjun@college.edu',   password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=arjun',   details: 'B.Tech ECE - 3rd Year' },
  { id: 's4', name: 'Sneha Reddy',        email: 'sneha@college.edu',   password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=sneha',   details: 'B.Tech CSE - 4th Year' },
  { id: 's5', name: 'Karan Joshi',        email: 'karan@college.edu',   password: 'password123', role: 'Student', avatar: 'https://i.pravatar.cc/150?u=karan',   details: 'B.Tech Mech - 2nd Year' },
];

async function hashAndSeed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 15000 });
    console.log('Connected!');

    // Drop existing users collection
    try { await mongoose.connection.db.collection('users').drop(); } catch(e) {}
    await mongoose.connection.db.createCollection('users');

    const SALT_ROUNDS = 10;
    const hashedUsers = [];

    for (const user of users) {
      const hashed = await bcrypt.hash(user.password, SALT_ROUNDS);
      hashedUsers.push({ ...user, password: hashed });
      console.log(`✓ Hashed password for ${user.email}`);
    }

    await mongoose.connection.db.collection('users').insertMany(hashedUsers);
    console.log('\n✅ All users inserted with bcrypt-hashed passwords!');
    console.log('\n--- Login Credentials (same passwords, now secured) ---');
    users.forEach(u => console.log(`[${u.role}] ${u.email} → password: ${u.password}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

hashAndSeed();
