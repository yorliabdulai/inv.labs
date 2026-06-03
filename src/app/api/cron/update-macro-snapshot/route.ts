import { NextResponse } from "next/server";
import {
  fetchMacroSnapshotFromWeb,
  upsertMacroSnapshot,
} from "@/lib/ai/research/macro-data-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await fetchMacroSnapshotFromWeb();
    if (!snapshot) {
      return NextResponse.json(
        { error: "Failed to parse Bank of Ghana macro data." },
        { status: 502 }
      );
    }

    await upsertMacroSnapshot(snapshot);

    return NextResponse.json({
      success: true,
      policyRate: snapshot.policyRate,
      effectiveDate: snapshot.effectiveDate,
      sefdPdfUrl: snapshot.sefdPdfUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Cron failed";
    console.error("update-macro-snapshot:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
