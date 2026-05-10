const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://meghanachitikila_db_user:dZVPIHyJH21Tk8oJ@cluster0.ky91fg2.mongodb.net/CampusConnect?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function seed() {
  try {
    console.log("Connecting to MongoDB with Native Driver...");
    await client.connect();
    const db = client.db("CampusConnect");
    const usersCollection = db.collection('users');

    const users = [
      { id: 'u1', name: 'System Admin', email: 'admin@campus.com', password: 'admin', role: 'Admin', details: 'Head of Administration' },
      { id: 'f1', name: 'Dr. Keerthi', email: 'keerthi.faculty@campus.com', password: 'faculty', role: 'Faculty', details: 'Computer Science HOD' },
      { id: 'f2', name: 'Prof. Jayanagasri', email: 'jaya@faculty.campus.com', password: 'faculty', role: 'Faculty', details: 'Mathematics Dept' },
      { id: 's1', name: 'Meghana Chitikila', email: 'meghana@student.com', password: 'student', role: 'Student', details: '3rd Year CSE' },
      { id: 's2', name: 'Leela Pavani', email: 'leela@student.com', password: 'student', role: 'Student', details: '3rd Year CSE' }
    ];

    console.log("Upserting sample users...");
    for (const user of users) {
      await usersCollection.updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      );
    }

    console.log("✅ Sample data inserted successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();
