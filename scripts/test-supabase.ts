
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Testing Supabase Connection...");
console.log("URL:", url);
console.log("Key:", key ? key.substring(0, 10) + "..." : "MISSING");

if (!url || !key) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
    try {
        console.log("Testing Auth Endpoint...");
        // Just checking if we can talk to the auth server. 
        // getUser() without a session usually returns null user, but validates connection.
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Supabase Auth Error:", error);
        } else {
            console.log("Auth Handshake Success. Session:", data.session ? "Active" : "None");
        }
    } catch (err) {
        console.error("Fetch Exception during Auth:", err);
    }
}

test();
