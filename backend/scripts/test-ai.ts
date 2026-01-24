import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyC0CsCCTqHGqMWf-i6681s0Jp8fFCKevV0";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello from Rove Health");
        console.log("Success:", result.response.text());
    } catch (e: any) {
        console.error("Error:", e.message);
        if (e.response) {
            console.error("Response:", await e.response.text());
        }
    }
}

run();
