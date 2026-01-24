
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    try {
        console.log("Testing OpenAI...");
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: "Say hello" }],
        });
        console.log("Success:", response.choices[0].message.content);
    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

main();
