import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  id: string;
  author: string;
  avatar: string;
  message: string;
  replyTo?: {
    id: string;
    author: string;
    message: string;
  };
  timestamp: Date;
  likes: number;
  likedBy: string[];
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '👤',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    replyTo: {
      type: {
        id: { type: String, required: true },
        author: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true, maxlength: 280 },
      },
      required: false,
      _id: false,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ChatMessageModel =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);

export default ChatMessageModel;