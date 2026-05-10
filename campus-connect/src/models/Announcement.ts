import mongoose, { Schema, model, models } from 'mongoose';

const AnnouncementSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, default: 'Update' },
  author: { type: String, default: 'Admin' },
}, { timestamps: true });

const Announcement = models.Announcement || model('Announcement', AnnouncementSchema);
export default Announcement;
