import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicDoubt extends Document {
  title: string;
  course: string;
  responses: number;
  status: 'pending' | 'answered';
  time: string;
  answers: { text: string; createdAt: Date }[];
  createdAt: Date;
}

const AcademicDoubtSchema = new Schema<IAcademicDoubt>({
  title: { type: String, required: true },
  course: { type: String, required: true },
  responses: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
  time: { type: String, default: 'Just now' },
  answers: [{ 
    text: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now } 
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.AcademicDoubt || mongoose.model<IAcademicDoubt>('AcademicDoubt', AcademicDoubtSchema);