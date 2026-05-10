const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Force use Google DNS to bypass local SRV resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://meghanachitikila_db_user:dZVPIHyJH21Tk8oJ@cluster0.ky91fg2.mongodb.net/CampusConnect?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({ id: String, name: String, email: String, password: String, role: String, avatar: String, details: String }, { strict: false });
const PermissionRequestSchema = new mongoose.Schema({ id: String, studentId: String, studentName: String, title: String, reason: String, status: String, submittedOn: String, targetFaculty: [String], priority: String }, { strict: false });
const FacultyRequestSchema = new mongoose.Schema({ id: String, facultyId: String, facultyName: String, title: String, reason: String, status: String, date: String, priority: String }, { strict: false });
const AnnouncementSchema = new mongoose.Schema({ id: String, title: String, content: String, date: String, type: String, author: String }, { strict: false });
const MessageSchema = new mongoose.Schema({ id: String, text: String, authorId: String, authorName: String, authorRole: String, type: String, timestamp: Date }, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const PermissionRequest = mongoose.models.PermissionRequest || mongoose.model('PermissionRequest', PermissionRequestSchema);
const FacultyRequest = mongoose.models.FacultyRequest || mongoose.model('FacultyRequest', FacultyRequestSchema);
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

async function migrate() {
  let attempts = 0;
  while (attempts < 5) {
    try {
      console.log(`Attempt ${attempts + 1}: Connecting to MongoDB...`);
      await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 10000 });
      console.log("Connected successfully!");
      
      const dataPath = path.join(__dirname, '..', 'src', 'lib', 'data.json');
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      
      if (data.users) await User.insertMany(data.users);
      if (data.requests) await PermissionRequest.insertMany(data.requests);
      if (data.facultyRequests) await FacultyRequest.insertMany(data.facultyRequests);
      if (data.announcements) await Announcement.insertMany(data.announcements);
      if (data.messages) await Message.insertMany(data.messages);
      
      console.log("✅ Migration Successful!");
      await mongoose.disconnect();
      return;
    } catch (err) {
      attempts++;
      console.log(`Failed (Attempt ${attempts}): ${err.message}`);
      if (attempts < 5) {
        console.log("Waiting 30 seconds before retry...");
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }
}

migrate();
