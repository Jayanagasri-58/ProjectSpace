
import mongoose from 'mongoose';
import fs from 'fs';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Force use Google DNS for SRV resolution stability
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple env parser
const envPath = join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim();
});

const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: String,
  avatar: String,
  details: String,
}, { timestamps: true });

const PermissionRequestSchema = new mongoose.Schema({
  id: String,
  studentId: String,
  studentName: String,
  title: String,
  reason: String,
  status: { type: String, default: 'Pending' },
  submittedOn: String,
  targetFaculty: [String],
  priority: String,
}, { timestamps: true });

const AnnouncementSchema = new mongoose.Schema({
  id: String,
  title: String,
  content: String,
  type: String,
  authorId: String,
  authorName: String,
  date: String,
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  id: String,
  text: String,
  authorId: String,
  authorName: String,
  authorRole: String,
  type: String,
  answers: { type: Number, default: 0 },
  tags: [String],
  timestamp: String,
}, { timestamps: true });

const FacultyRequestSchema = new mongoose.Schema({
  id: String,
  facultyId: String,
  facultyName: String,
  title: String,
  reason: String,
  status: { type: String, default: 'Pending' },
  date: String,
  priority: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const PermissionRequest = mongoose.models.PermissionRequest || mongoose.model('PermissionRequest', PermissionRequestSchema);
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const FacultyRequest = mongoose.models.FacultyRequest || mongoose.model('FacultyRequest', FacultyRequestSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      family: 4 // Force IPv4
    });
    console.log('Connected!');

    // CLEANING DATA
    console.log('Wiping existing data...');
    await User.deleteMany({});
    await PermissionRequest.deleteMany({});
    await Announcement.deleteMany({});
    await Message.deleteMany({});
    await FacultyRequest.deleteMany({});
    console.log('Data wiped.');

    // INSERTING USERS
    console.log('Inserting new users...');
    const users = [
      {
        id: "admin_1",
        name: "Dr. Vikram Singh",
        email: "admin@college.edu",
        password: "password123",
        role: "Admin",
        avatar: "https://i.pravatar.cc/150?u=vikram",
        details: "Head of Administration"
      },
      {
        id: "fac_1",
        name: "Prof. Anjali Verma",
        email: "faculty@college.edu",
        password: "password123",
        role: "Faculty",
        avatar: "https://i.pravatar.cc/150?u=anjali",
        details: "Proctor - CSE (3rd Year)"
      },
      {
        id: "fac_2",
        name: "Dr. Ramesh Kumar",
        email: "ramesh@college.edu",
        password: "password123",
        role: "Faculty",
        avatar: "https://i.pravatar.cc/150?u=ramesh",
        details: "HOD - ECE"
      },
      {
        id: "stud_1",
        name: "Rohit Sharma",
        email: "student@college.edu",
        password: "password123",
        role: "Student",
        avatar: "https://i.pravatar.cc/150?u=rohit",
        details: "B.Tech CSE - 3rd Year"
      },
      {
        id: "stud_2",
        name: "Priya Patel",
        email: "priya@college.edu",
        password: "password123",
        role: "Student",
        avatar: "https://i.pravatar.cc/150?u=priya",
        details: "B.Tech CSE - 2nd Year"
      }
    ];

    await User.insertMany(users);
    console.log('Users inserted.');

    // INSERTING INITIAL REQUESTS
    console.log('Inserting initial requests...');
    const requests = [
      {
        id: "req_1",
        studentId: "stud_1",
        studentName: "Rohit Sharma",
        title: "Hackathon Permission",
        reason: "Requesting permission to attend Smart India Hackathon at IIT Delhi.",
        status: "Pending",
        submittedOn: "May 10, 2026",
        targetFaculty: ["fac_1"],
        priority: "High"
      },
      {
        id: "req_2",
        studentId: "stud_2",
        studentName: "Priya Patel",
        title: "Medical Leave",
        reason: "Suffering from viral fever. Need leave for 2 days.",
        status: "Approved",
        submittedOn: "May 9, 2026",
        targetFaculty: ["fac_1"],
        priority: "Medium"
      }
    ];
    await PermissionRequest.insertMany(requests);

    console.log('Database seeding complete! 🚀');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
