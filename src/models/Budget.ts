import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  user: mongoose.Types.ObjectId;
  monthlyTarget: number;
  daysRemaining?: number;
}

const budgetSchema = new Schema<IBudget>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyTarget: { type: Number, default: 41000 },
  daysRemaining: { type: Number }
}, { timestamps: true });

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);