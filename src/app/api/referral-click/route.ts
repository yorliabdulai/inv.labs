import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Uses the service role key to bypass RLS since unauthenticated 
// users clicking links need to update the partner's click count.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ success: false, error: "No ref provided" }, { status: 400 });
  }

  try {
    // Perform a select then an update to increment the click count.
    const { data, error: fetchError } = await supabase
      .from('partners')
      .select('id, clicks_count')
      .eq('referral_code', ref)
      .single();

    if (!fetchError && data) {
      await supabase
        .from('partners')
        .update({ clicks_count: (data.clicks_count || 0) + 1 })
        .eq('id', data.id);
    }
  } catch (err) {
    console.error("Referral click tracking error:", err);
  }

  // Always return success so the client doesn't block or error visibly
  return NextResponse.json({ success: true });
}
