import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicFlashcard extends Document {
  course: string;
  q: string;
  a: string;
  mastery: number;
  createdAt: Date;
}

const AcademicFlashcardSchema = new Schema<IAcademicFlashcard>({
  course: { type: String, required: true },
  q: { type: String, required: true },
  a: { type: String, required: true },
  mastery: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.AcademicFlashcard || mongoose.model<IAcademicFlashcard>('AcademicFlashcard', AcademicFlashcardSchema);