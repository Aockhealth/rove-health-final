import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { executeUnifiedAI } from "@backend/actions/ai-orchestrator/orchestrator";
import { UnifiedAIRequest } from "@/lib/ai/unified-schemas";

type ClientMessage = {
    role: "user" | "assistant" | string;
    content: string;
};

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
        const { messages: clientMessages } = body ?? {};

        // Basic input validation & filtering
        if (!Array.isArray(clientMessages)) {
            return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
        }

        const normalizedMessages: Array<{ role: "user" | "assistant"; content: string }> = (clientMessages as ClientMessage[])
            .filter((message) => message && (message.role === "user" || message.role === "assistant"))
            .map((message) => ({
                role: message.role === "user" ? "user" : "assistant",
                content: String(message.content || "")
            }));

        const latestQuery = normalizedMessages[normalizedMessages.length - 1]?.content || "";

        // Backend orchestrator handles ALL context assembly via buildUnifiedContext()
        // No client-side contextHints needed — eliminates duplicate DB fetching
        const request: UnifiedAIRequest = {
            skill: "chatbot",
            userMessage: latestQuery,
            conversationHistory: normalizedMessages,
            clientSurface: "web_chat_widget",
            memoryMode: "read_only"
        };

        const response = await executeUnifiedAI(request);

        return NextResponse.json({
            ok: !response.safety?.flagged,
            ai: {
                narrative: response.narrative,
                structuredPayload: response.structuredPayload || null,
                safety: response.safety || null,
                telemetry: response.telemetry || null
            },
            // Keep legacy fallback shape while frontend migrates.
            choices: [
                {
                    message: {
                        content: response.narrative
                    }
                }
            ]
        });

    } catch (err: any) {
        console.error("Chatbot Orchestrator Error:", err);
        return NextResponse.json(
            { error: "Server error", details: err?.message ?? String(err) },
            { status: 500 }
        );
    }
}
