import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AcademicDoubt from '@/models/AcademicDoubt';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { doubtId, answer } = body;

    if (!doubtId || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedDoubt = await AcademicDoubt.findByIdAndUpdate(
      doubtId,
      {
        $push: { answers: { text: answer } },
        $inc: { responses: 1 },
        $set: { status: 'answered' }
      },
      { new: true }
    );

    if (!updatedDoubt) {
      return NextResponse.json({ error: 'Doubt not found' }, { status: 404 });
    }

    return NextResponse.json(updatedDoubt, { status: 200 });
  } catch (error) {
    console.error('Answer posting error:', error);
    return NextResponse.json({ error: 'Failed to post answer' }, { status: 500 });
  }
}