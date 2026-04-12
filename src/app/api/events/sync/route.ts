import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Database not configured. Set up PostgreSQL first." },
    { status: 503 }
  );
}
