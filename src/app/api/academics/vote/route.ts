import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AcademicPoll from '@/models/AcademicPoll';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { pollId, optionIndex } = body;

    const poll = await AcademicPoll.findById(pollId);
    if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    await poll.save();

    return NextResponse.json({ success: true, poll });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}