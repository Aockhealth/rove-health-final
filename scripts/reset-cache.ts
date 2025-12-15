
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env vars from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

async function clearCache() {
    console.log("Loading env from:", envPath);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error("Missing Env Vars. URL exists:", !!url, "Key exists:", !!key);
        process.exit(1);
    }

    const supabase = createClient(url, key);

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
