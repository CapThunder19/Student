import { NextApiRequest } from 'next';
import { NextApiResponseWithSocket, initSocketServer } from '@/lib/socket';

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  try {
    initSocketServer(res);
    res.status(200).end();
  } catch (err) {
    console.error('Socket init error:', err);
    res.status(500).end();
  }
}