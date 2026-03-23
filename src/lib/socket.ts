import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiResponse } from 'next';
import { Socket as NetSocket } from 'net';
import dbConnect from '@/lib/mongodb';
import ChatMessageModel from '@/models/ChatMessage';

export interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}
export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}
export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}
export interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
}

const HISTORY_LIMIT = 100;

const toClientMessage = (doc: {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: Date | string;
  likes: number;
  likedBy: string[];
}): ChatMessage => ({
  id: doc.id,
  author: doc.author,
  avatar: doc.avatar,
  message: doc.message,
  timestamp: new Date(doc.timestamp).toISOString(),
  likes: doc.likes || 0,
  likedBy: doc.likedBy || [],
});

export const initSocketServer = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Starting Socket.io server...');
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket_io',
      addTrailingSlash: false,
      transports: ['websocket'],
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_community', async (user: { name: string; email: string; image?: string }) => {
        console.log('User joined community:', user.name);
        socket.data.user = user;
        socket.join('community');

        try {
          await dbConnect();
          const historyDocs = await ChatMessageModel.find({})
            .sort({ timestamp: -1 })
            .limit(HISTORY_LIMIT)
            .lean();

          const history = historyDocs.map((doc) =>
            toClientMessage({
              id: doc.id,
              author: doc.author,
              avatar: doc.avatar,
              message: doc.message,
              timestamp: doc.timestamp,
              likes: doc.likes,
              likedBy: doc.likedBy,
            })
          );

          socket.emit('chat_history', history.reverse());
        } catch (error) {
          console.error('Failed to load chat history:', error);
          socket.emit('chat_history', []);
        }

        io.to('community').emit('online_count', io.sockets.adapter.rooms.get('community')?.size || 0);
      });

      socket.on('send_message', async (msg: ChatMessage) => {
        console.log('Message received on server, broadcasting:', msg.message);
        if (!socket.rooms.has('community')) {
          socket.join('community');
        }

        let savedMessage = msg;
        try {
          await dbConnect();
          const persisted = await ChatMessageModel.findOneAndUpdate(
            { id: msg.id },
            {
              id: msg.id,
              author: msg.author,
              avatar: msg.avatar,
              message: msg.message,
              timestamp: msg.timestamp,
              likes: msg.likes,
              likedBy: msg.likedBy,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          ).lean();

          if (persisted) {
            savedMessage = toClientMessage({
              id: persisted.id,
              author: persisted.author,
              avatar: persisted.avatar,
              message: persisted.message,
              timestamp: persisted.timestamp,
              likes: persisted.likes,
              likedBy: persisted.likedBy,
            });
          }
        } catch (error) {
          console.error('Failed to persist message:', error);
        }

        io.to('community').emit('receive_message', savedMessage);
      });

      socket.on('typing', (data: { name: string; isTyping: boolean }) => {
        socket.to('community').emit('user_typing', data);
      });

      socket.on('like_message', async (data: { messageId: string; userId: string }) => {
        try {
          await dbConnect();
          const result = await ChatMessageModel.updateOne(
            { id: data.messageId, likedBy: { $ne: data.userId } },
            {
              $addToSet: { likedBy: data.userId },
              $inc: { likes: 1 },
            }
          );

          if (result.modifiedCount > 0) {
            io.to('community').emit('message_liked', data);
          }
        } catch (error) {
          console.error('Failed to persist like:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        io.to('community').emit('online_count', io.sockets.adapter.rooms.get('community')?.size || 0);
      });
    });

    res.socket.server.io = io;
    console.log('Socket.io server started!');
  } else {
    console.log('Socket.io server already running');
  }
  return res.socket.server.io;
};
