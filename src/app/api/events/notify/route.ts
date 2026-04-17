import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://n8nmay.xyz/webhook/d066f4e4-ab85-454d-b415-f1c22a4e17f1";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { eventTitle, eventDate, eventLocation, eventLink, eventCover } = body;

  if (!eventTitle || !eventLink) {
    return NextResponse.json({ error: "Missing event data" }, { status: 400 });
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        userName: session.user.name || "Utilisateur Lumina",
        eventTitle,
        eventDate: eventDate || "",
        eventLocation: eventLocation || "",
        eventLink,
        eventCover: eventCover || "",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
