import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getEmailMessagesByThreadId,
  getEmailThreads,
  markEmailThreadRead,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("thread");

  try {
    if (threadId) {
      const [thread] = (await getEmailThreads()).filter(
        (t) => t.id === threadId
      );
      const messages = await getEmailMessagesByThreadId({ threadId });
      return NextResponse.json({ thread, messages });
    }

    const threads = await getEmailThreads();
    return NextResponse.json({ threads });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to load email" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, action } = body;

  if (!id || action !== "read") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  await markEmailThreadRead({ id });
  return NextResponse.json({ ok: true });
}
