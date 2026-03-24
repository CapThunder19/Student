import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedExpense extends Document {
  user: mongoose.Types.ObjectId; // The primary user who tracks this
  desc: string;
  amount: number;
  paidBy: 'You' | string;
  splitWith: string;
  splitType: 'Equally' | 'Custom';
  date: Date;
  impactAmount: number; // Positive if owed to user, negative if user owes
}

const sharedExpenseSchema = new Schema<ISharedExpense>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  desc: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  splitWith: { type: String, required: true },
  splitType: { type: String, default: 'Equally' },
  date: { type: Date, default: Date.now },
  impactAmount: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.SharedExpense || mongoose.model<ISharedExpense>('SharedExpense', sharedExpenseSchema);