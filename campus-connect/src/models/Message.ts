import mongoose, { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  type: { type: String, enum: ['message', 'doubt'], default: 'message' },
  timestamp: { type: Date, default: Date.now },
  tags: [{ type: String }],
  answers: { type: Number, default: 0 },
}, { timestamps: true });

const Message = models.Message || model('Message', MessageSchema);
export default Message;
