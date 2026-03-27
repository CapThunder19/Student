import { NextResponse } from "next/server";

// Temporary placeholder route for auth.
// Replace with real NextAuth configuration when ready.
export async function GET() {
  return NextResponse.json(
    { error: "Auth route not implemented" },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Auth route not implemented" },
    { status: 501 }
  );
}
