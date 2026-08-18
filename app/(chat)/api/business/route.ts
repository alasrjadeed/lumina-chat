import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  createBusiness,
  createChannel,
  deleteBusiness,
  getAllBusinesses,
  getChannelsByBusinessId,
} from "@/lib/db/queries";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 128);
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businesses = await getAllBusinesses();

    const allChannels: Awaited<ReturnType<typeof getChannelsByBusinessId>>[] =
      [];
    for (const b of businesses) {
      const ch = await getChannelsByBusinessId(b.id);
      allChannels.push(ch);
    }

    return NextResponse.json({
      ok: true,
      businesses,
      channels: allChannels.flat(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, services, ...rest } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    let slug = slugify(name);
    const businesses = await getAllBusinesses();
    const existingSlugs = businesses.map((b) => b.slug);
    let counter = 1;
    while (existingSlugs.includes(slug)) {
      slug = `${slugify(name)}-${counter}`;
      counter++;
    }

    const biz = await createBusiness({
      name: name.trim(),
      slug,
      tagline: rest.tagline || null,
      description: rest.description || null,
      website: rest.website || null,
      email: rest.email || null,
      phone: rest.phone || null,
      address: rest.address || null,
      hoursOpen: rest.hoursOpen || null,
      hoursClose: rest.hoursClose || null,
      hoursDays: rest.hoursDays || null,
      paymentTerms: rest.paymentTerms || null,
    });

    await createChannel({ businessId: biz.id, type: "email", config: {} });
    await createChannel({ businessId: biz.id, type: "whatsapp", config: {} });
    await createChannel({ businessId: biz.id, type: "twilio", config: {} });

    if (Array.isArray(services)) {
      const { createBusinessService } = await import("@/lib/db/queries");
      for (const s of services) {
        await createBusinessService({
          businessId: biz.id,
          name: s.name,
          category: s.category || "custom",
          description: s.description || "",
          price: typeof s.price === "number" ? Math.round(s.price * 100) : 0,
          unit: s.unit || "one-time",
        });
      }
    }

    return NextResponse.json({ ok: true, business: biz });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    await deleteBusiness(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
