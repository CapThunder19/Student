import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatMessageModel from '@/models/ChatMessage';

const HISTORY_LIMIT = 100;

export async function GET() {
  try {
    await dbConnect();
    const docs = await ChatMessageModel.find({})
      .sort({ timestamp: -1 })
      .limit(HISTORY_LIMIT)
      .lean();

    const messages = docs
      .reverse()
      .map((doc) => ({
        id: doc.id,
        author: doc.author,
        avatar: doc.avatar,
        message: doc.message,
        timestamp: new Date(doc.timestamp).toISOString(),
        likes: doc.likes || 0,
        likedBy: doc.likedBy || [],
      }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Failed to fetch community messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = {
      id: String(body.id || ''),
      author: String(body.author || 'Anonymous'),
      avatar: String(body.avatar || '👤'),
      message: String(body.message || '').trim(),
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      likes: Number(body.likes || 0),
      likedBy: Array.isArray(body.likedBy) ? body.likedBy.map(String) : [],
    };

    if (!message.id || !message.message) {
      return NextResponse.json({ error: 'Invalid message payload' }, { status: 400 });
    }

    await dbConnect();
    const saved = await ChatMessageModel.findOneAndUpdate(
      { id: message.id },
      message,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    if (!saved) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    return NextResponse.json({
      message: {
        id: saved.id,
        author: saved.author,
        avatar: saved.avatar,
        message: saved.message,
        timestamp: new Date(saved.timestamp).toISOString(),
        likes: saved.likes || 0,
        likedBy: saved.likedBy || [],
      },
    });
  } catch (error) {
    console.error('Failed to save community message:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}