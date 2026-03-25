import mongoose, { Document, Schema } from 'mongoose';

export type ComplaintSeverity = 'red' | 'yellow' | 'green';
export type ComplaintStatus = 'open' | 'in-progress' | 'resolved' | 'escalated';

export type ComplaintAttachment = {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  uploadedAt: Date;
};

export interface IComplaint extends Document {
  id: string;
  studentName: string;
  rollNo: string;
  studentEmail?: string;
  category: string;
  title: string;
  description: string;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  assignedDepartment: string;
  assignedAdmin: string;
  attachments: ComplaintAttachment[];
  adminNotificationCount: number;
  lastAdminNotificationAt?: Date;
  escalationCount: number;
  lastEscalatedAt?: Date;
  statusUpdatedAt?: Date;
  createdAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      default: 'Anonymous Student',
    },
    rollNo: {
      type: String,
      trim: true,
      default: '',
    },
    studentEmail: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    severity: {
      type: String,
      required: true,
      enum: ['red', 'yellow', 'green'],
      default: 'yellow',
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'in-progress', 'resolved', 'escalated'],
      default: 'open',
    },
    assignedDepartment: {
      type: String,
      trim: true,
      default: '',
    },
    assignedAdmin: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          mimeType: { type: String, required: true, trim: true },
          size: { type: Number, required: true, min: 0 },
          dataUrl: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    adminNotificationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAdminNotificationAt: {
      type: Date,
      default: null,
    },
    escalationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastEscalatedAt: {
      type: Date,
      default: null,
    },
    statusUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ComplaintModel =
  mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', complaintSchema);

export default ComplaintModel;