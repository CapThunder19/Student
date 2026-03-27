import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SharedExpense from '@/models/SharedExpense';
import mongoose from 'mongoose';
import { getAuthContext } from '@/lib/request-auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { userId: userIdStr } = getAuthContext(req);

    const body = await req.json();
    const { desc, amount, paidBy, splitWith, splitType, impactAmount } = body;

    // simplistic validation
    if (!desc || !amount || !paidBy || !splitWith) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sharedExpense = await SharedExpense.create({
      user: new mongoose.Types.ObjectId(userIdStr),
      desc,
      amount,
      paidBy,
      splitWith,
      splitType: splitType || 'Equally',
      impactAmount,
    });

    return NextResponse.json({ success: true, sharedExpense });
  } catch (error) {
    console.error('Shared expense POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}