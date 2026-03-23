import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Please provide email, password, and name' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new user (password will be hashed by pre-save hook)
    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      name,
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id.toString(),
        email: newUser.email,
      },
      process.env.JWT_SECRET || '1234567890',
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        message: 'Signup successful',
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      return NextResponse.json(
        { error: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
