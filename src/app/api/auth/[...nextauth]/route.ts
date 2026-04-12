import { NextResponse } from "next/server";

// NextAuth disabled until database is configured
export async function GET() {
  return NextResponse.json({ user: null });
}

export async function POST() {
  return NextResponse.json({ user: null });
}
