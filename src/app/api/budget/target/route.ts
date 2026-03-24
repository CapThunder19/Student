import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Budget from '@/models/Budget';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    let userIdStr = session?.user?.id;
    if (!userIdStr) {
      // Fallback for development if not logged in
      userIdStr = '000000000000000000000000';
    }

    const body = await req.json();
    const { monthlyTarget, daysRemaining } = body;

    const updateData: any = {};
    if (monthlyTarget !== undefined) updateData.monthlyTarget = monthlyTarget;
    if (daysRemaining !== undefined) updateData.daysRemaining = daysRemaining;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userIdStr) },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, budget });
  } catch (error) {
    console.error('Target POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}