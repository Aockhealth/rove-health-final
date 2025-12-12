
import { createClient } from "@supabase/supabase-js";

async function clearCache() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Missing Env Vars");
        process.exit(1);
    }
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const today = new Date().toISOString().split('T')[0];
    console.log(`Clearing cache for ${today}...`);

    const { error } = await supabase
        .from("daily_plans")
        .delete()
        .eq("date", today);

    if (error) console.error("Error:", error);
    else console.log("Cache cleared successfully! 🗑️");
}

clearCache();
