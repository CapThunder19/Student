import mongoose, { Document, Schema } from 'mongoose';

export interface IPG extends Document {
  name: string;
  type: 'pg' | 'flat' | 'hostel';
  area: string;
  address: string;
  price: number;
  beds: number;
  bathrooms: number;
  floor: string;
  furnishing: 'furnished' | 'semi-furnished' | 'unfurnished';
  amenities: string[];
  rules: string;
  genderPreference: 'male' | 'female' | 'any';
  verified: boolean;
  availableFrom: string;
  latitude: number;
  longitude: number;
  description: string;
  contact: string;
  ownerName: string;
  photos: string[];
  createdAt: Date;
}

const pgSchema = new Schema<IPG>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['pg', 'flat', 'hostel'], required: true },
    area: { type: String, required: true },
    address: { type: String, default: '' },
    price: { type: Number, required: true },
    beds: { type: Number, required: true, default: 1 },
    bathrooms: { type: Number, default: 1 },
    floor: { type: String, default: '' },
    furnishing: { type: String, enum: ['furnished', 'semi-furnished', 'unfurnished'], default: 'unfurnished' },
    amenities: { type: [String], default: [] },
    rules: { type: String, default: '' },
    genderPreference: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
    verified: { type: Boolean, default: false },
    availableFrom: { type: String, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    description: { type: String, default: '' },
    contact: { type: String, default: '' },
    ownerName: { type: String, default: '' },
    photos: { type: [String], default: [] },
  },
  { timestamps: true }
);

const PG = mongoose.models.PG || mongoose.model<IPG>('PG', pgSchema);

export default PG;
