import mongoose, { Schema, model, models } from 'mongoose';

const FacultyRequestSchema = new Schema({
  id: { type: String, required: true, unique: true },
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  title: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  date: { type: String, required: true },
  priority: { type: String, default: 'Medium' },
}, { timestamps: true });

const FacultyRequest = models.FacultyRequest || model('FacultyRequest', FacultyRequestSchema);
export default FacultyRequest;
