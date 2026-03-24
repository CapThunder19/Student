import mongoose, { Document, Schema } from 'mongoose';

export interface IPollOption {
  label: string;
  votes: number;
}

export interface IAcademicPoll extends Document {
  question: string;
  options: IPollOption[];
  totalVotes: number;
  endDate: string;
  createdAt: Date;
}

const PollOptionSchema = new Schema<IPollOption>({
  label: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const AcademicPollSchema = new Schema<IAcademicPoll>({
  question: { type: String, required: true },
  options: [PollOptionSchema],
  totalVotes: { type: Number, default: 0 },
  endDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.AcademicPoll || mongoose.model<IAcademicPoll>('AcademicPoll', AcademicPollSchema);