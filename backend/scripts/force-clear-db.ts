
import dotenv from "dotenv";
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
        console.log("Deleting all daily_plans...");
        const res = await client.query("DELETE FROM daily_plans");
        console.log(`Deleted ${res.rowCount} rows.`);
    } catch (e: any) {
        console.error("SQL Error:", e);
    } finally {
        await client.end();
    }
}

run();
