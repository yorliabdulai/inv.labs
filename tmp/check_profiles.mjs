import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  const { data, count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact" });

  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles count:", count);
    console.log("Profiles data:", data);
  }
}

checkProfiles();
