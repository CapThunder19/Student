import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';
import { getAuthContext } from '@/lib/request-auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { userId: userIdStr } = getAuthContext(req);

    const body = await req.json();
    const { desc, amount, category, type } = body;

    if (!desc || !amount || !category || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await Transaction.create({
      user: new mongoose.Types.ObjectId(userIdStr),
      desc,
      amount,
      category,
      type,
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error('Transaction POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}