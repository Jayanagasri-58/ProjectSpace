import mongoose, { Schema, model, models } from 'mongoose';

const PermissionRequestSchema = new Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  title: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  submittedOn: { type: String, required: true },
  targetFaculty: [{ type: String }],
  priority: { type: String, default: 'Medium' },
  hasAttachment: { type: Boolean, default: false },
}, { timestamps: true });

const PermissionRequest = models.PermissionRequest || model('PermissionRequest', PermissionRequestSchema);
export default PermissionRequest;
