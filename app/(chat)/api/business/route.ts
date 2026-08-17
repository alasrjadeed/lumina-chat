import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getAppointments, getLeads } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "all";

  try {
    if (type === "leads") {
      const leads = await getLeads({ limit: 200 });
      return NextResponse.json({ leads });
    }

    if (type === "appointments") {
      const appointments = await getAppointments();
      return NextResponse.json({ appointments });
    }

    const [leads, appointments] = await Promise.all([
      getLeads({ limit: 200 }),
      getAppointments(),
    ]);

    return NextResponse.json({ leads, appointments });
  } catch (error) {
    console.error("Business data error:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
