
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
        const res = await client.query("SELECT date, plan_content FROM daily_plans ORDER BY date ASC");

        console.log(`Found ${res.rowCount} plans.`);
        res.rows.forEach(row => {
            const p = row.plan_content;
            console.log(`\nDATE: ${row.date}`);
            console.log(`RIVER: ${p.river}`);
            console.log(`FUEL: ${JSON.stringify(p.blueprint.diet.core_needs.map((n: any) => n.title))}`);
            console.log(`MOVE: ${JSON.stringify(p.blueprint.exercise.best.map((n: any) => n.title))}`);
            console.log(`RITUALS: ${JSON.stringify(p.blueprint.daily_flow)}`);
        });

    } catch (e: any) {
        console.error("SQL Error:", e);
    } finally {
        await client.end();
    }
}

run();
