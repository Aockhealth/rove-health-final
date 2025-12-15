
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pg from 'pg';

const { Client } = pg;

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
    console.log("Connecting to DB...");
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const sql = fs.readFileSync('supabase/fix_rls.sql', 'utf8');
        console.log("Running SQL...");
        await client.query(sql);
        console.log("Success! RLS Policies applied.");
    } catch (e: any) {
        console.error("SQL Error:", e);
    } finally {
        await client.end();
    }
}

run();
