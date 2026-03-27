import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Budget from '@/models/Budget';
import Transaction from '@/models/Transaction';
import SharedExpense from '@/models/SharedExpense';
import mongoose from 'mongoose';
import { getAuthContext } from '@/lib/request-auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { userId: userIdStr } = getAuthContext(req);

    const userId = new mongoose.Types.ObjectId(userIdStr);

    let budget = await Budget.findOne({ user: userId });
    if (!budget) {
      budget = await Budget.create({ user: userId, monthlyTarget: 20000 });
    }

    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
    const sharedExpenses = await SharedExpense.find({ user: userId }).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      budget,
      transactions,
      sharedExpenses
    });
  } catch (error) {
    console.error('Budget GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}