import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Basic in-memory rate limiting for development
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const RATE_LIMIT_COUNT = 20; // 20 requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting check
        const now = Date.now();
        const userLimit = rateLimitMap.get(user.id) || { count: 0, lastReset: now };

        if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
            userLimit.count = 1;
            userLimit.lastReset = now;
        } else {
            userLimit.count++;
        }
        rateLimitMap.set(user.id, userLimit);

        if (userLimit.count > RATE_LIMIT_COUNT) {
            return NextResponse.json({ error: "Rate limit exceeded. Please try again in a minute." }, { status: 429 });
        }

        const body = await req.json();
        const { messages: clientMessages, model, temperature, max_tokens, safeData } = body ?? {};

        if (!process.env.GROQ_API_KEY_2) {
            return NextResponse.json(
                { error: "Missing GROQ_API_KEY on server" },
                { status: 500 }
            );
        }

        // Basic input validation & filtering
        if (!Array.isArray(clientMessages)) {
            return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
        }

        // Security: Only allow user/assistant roles from the client
        const safeMessages = clientMessages
            .filter((m: any) => m?.role === "user" || m?.role === "assistant")
            .map((m: any) => ({
                role: m.role,
                content: String(m.content || "").slice(0, 2000) // Prevent massive prompt injection
            }));

        // Server-managed System Prompt (Cannot be overridden by client)
        const systemPrompt = {
            role: "system",
            content: `You are Rove AI, a supportive and knowledgeable menstrual cycle assistant.

STRICT RULE 1: Do NOT use any emojis in your response. Not even one.
STRICT RULE 2: You only discuss women's health, menstrual cycles, and related wellness topics (nutrition, fitness for cycles). 
If the user asks about anything unrelated to women's health (e.g., politics, coding, general trivia, etc.), you MUST politely decline and state: "I'm sorry, I can only provide support and information regarding women's health and cycle-related wellness topics."

STRICT RULE 3 (CRITICAL SAFETY): If the user expresses any suicidal thoughts, self-harm, or mentions "I want to die", you MUST immediately provide Indian crisis helplines:
- NIMHANS: 080-46110007
- Vandrevala Foundation: +91 9999666555
- KIRAN: 1800-599-0019
- iCall (TISS): 022-25521111
Directly urge them to contact these professionals immediately.

Current user data (sanitized for privacy):
${JSON.stringify(safeData || {}, null, 2)}

Guidelines:
- Be warm, empathetic, and encouraging
- Provide specific, actionable advice based on the user's current cycle phase
- Reference their cycle day, phase, and any logged symptoms when relevant
- Keep responses concise (2-3 sentences unless more detail is needed)
- If asked about medical concerns, advise consulting a healthcare provider`
        };

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY_2}`,
            },
            body: JSON.stringify({
                model: model ?? "llama-3.3-70b-versatile",
                messages: [systemPrompt, ...safeMessages],
                temperature: typeof temperature === "number" ? temperature : 0.7,
                max_tokens: typeof max_tokens === "number" ? max_tokens : 500,
            }),
        });

        if (!groqRes.ok) {
            const text = await groqRes.text();
            return NextResponse.json(
                { error: `Groq API error`, details: text },
                { status: groqRes.status }
            );
        }

        const data = await groqRes.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json(
            { error: "Server error", details: err?.message ?? String(err) },
            { status: 500 }
        );
    }
}
