import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PG from '@/models/PG';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (type && type !== 'all') query.type = type;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const listings = await PG.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: listings });
  } catch (error) {
    console.error('GET /api/housing error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.area || !body.price || !body.latitude || !body.longitude) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, area, price, latitude, longitude' },
        { status: 400 }
      );
    }

    const pg = await PG.create(body);
    return NextResponse.json({ success: true, data: pg }, { status: 201 });
  } catch (error) {
    console.error('POST /api/housing error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create listing' }, { status: 500 });
  }
}
