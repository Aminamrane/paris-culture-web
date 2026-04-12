import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString().split("T")[0];
  const params = new URLSearchParams({
    limit: "3",
    where: `date_end>="${now}" AND lat_lon IS NOT NULL`,
    order_by: "date_start ASC",
    timezone: "Europe/Paris",
  });
  const url = `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records?${params}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json({
      status: res.status,
      count: data.results?.length,
      firstTitle: data.results?.[0]?.title?.substring(0, 40),
      url,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e), url });
  }
}
