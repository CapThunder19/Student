import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatMessageModel from '@/models/ChatMessage';
import { getAuthContext } from '@/lib/request-auth';

const HISTORY_LIMIT = 100;

type StoredReplyTo = {
  id: string;
  author: string;
  message: string;
};

type StoredChatMessage = {
  id: string;
  author: string;
  avatar: string;
  message: string;
  replyTo?: StoredReplyTo;
  timestamp: Date | string;
  likes: number;
  likedBy: string[];
};

const toResponseMessage = (doc: StoredChatMessage) => ({
  id: doc.id,
  author: doc.author,
  avatar: doc.avatar,
  message: doc.message,
  replyTo: doc.replyTo
    ? {
        id: doc.replyTo.id,
        author: doc.replyTo.author,
        message: doc.replyTo.message,
      }
    : undefined,
  timestamp: new Date(doc.timestamp).toISOString(),
  likes: doc.likes || 0,
  likedBy: doc.likedBy || [],
});

export async function GET() {
  try {
    await dbConnect();
    const docs = await ChatMessageModel.find({})
      .sort({ timestamp: -1 })
      .limit(HISTORY_LIMIT)
      .lean<StoredChatMessage[]>();

    const messages = docs.reverse().map(toResponseMessage);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Failed to fetch community messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const replyPayload = body.replyTo;

    const replyTo =
      replyPayload &&
      typeof replyPayload === 'object' &&
      String(replyPayload.id || '').trim() &&
      String(replyPayload.message || '').trim()
        ? {
            id: String(replyPayload.id),
            author: String(replyPayload.author || 'Anonymous').trim(),
            message: String(replyPayload.message).trim().slice(0, 280),
          }
        : undefined;

    const message = {
      id: String(body.id || ''),
      author: String(body.author || 'Anonymous'),
      avatar: String(body.avatar || '👤'),
      message: String(body.message || '').trim(),
      replyTo,
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
    ).lean<StoredChatMessage | null>();

    if (!saved) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    return NextResponse.json({
      message: toResponseMessage(saved),
    });
  } catch (error) {
    console.error('Failed to save community message:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const messageId = String(body.messageId || '').trim();
    const { userId } = getAuthContext(req);

    if (!messageId || !userId) {
      return NextResponse.json({ error: 'Invalid reaction payload' }, { status: 400 });
    }

    await dbConnect();
    const existing = await ChatMessageModel.findOne({ id: messageId }).lean<StoredChatMessage | null>();

    if (!existing) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const hasLiked = Array.isArray(existing.likedBy) && existing.likedBy.includes(userId);

    const updated = await ChatMessageModel.findOneAndUpdate(
      { id: messageId },
      hasLiked
        ? {
            $pull: { likedBy: userId },
            $inc: { likes: -1 },
          }
        : {
            $addToSet: { likedBy: userId },
            $inc: { likes: 1 },
          },
      { new: true }
    ).lean<StoredChatMessage | null>();

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
    }

    return NextResponse.json({
      messageId,
      userId,
      liked: !hasLiked,
      likes: Math.max(updated.likes || 0, 0),
    });
  } catch (error) {
    console.error('Failed to update community message reaction:', error);
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
  }
}