import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Send, User, Bot, Phone, PhoneOff, Mic, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { calculatePhase, type CycleSettings, type DailyLog } from "@shared/cycle/phase";

const LOG_WINDOW_DAYS = 90;

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    feedback?: 1 | -1 | null; // 👍 = 1, 👎 = -1
}


/**
 * Strict privacy layer: removes identifiers recursively from any object or array.
 * Target keys (exact matches only): "user_id", "email", "full_name"
 */
function sanitizeCycleData(data: any): any {
    const sensitiveKeys = ["user_id", "email", "full_name"];

    if (Array.isArray(data)) {
        return data.map((item) => sanitizeCycleData(item));
    }

    if (data !== null && typeof data === "object") {
        const sanitized: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (sensitiveKeys.includes(key)) continue;
                sanitized[key] = sanitizeCycleData(data[key]);
            }
        }
        return sanitized;
    }

    return data;
}

/**
 * Hard-strips all emojis from a string using a comprehensive regex.
 */
function stripEmojis(text: string): string {
    return text.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ""
    ).trim();
}

export function ChatInterface({ onClose }: { onClose?: () => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isAgentActive, setIsAgentActive] = useState(false);
    const [agentStatus, setAgentStatus] = useState<string>("idle");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const conversationRef = useRef<any>(null);

    const cycleDataRef = useRef<any>(null);
    const safeCycleDataRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const sessionIdRef = useRef<string>(
        typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`
    );


    const fetchCycleData = async () => {
        try {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();

            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error("Auth error:", authError);
                throw new Error("User not authenticated");
            }

            const { data: userData, error: userError } = await supabase
                .from("user_onboarding")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (userError) console.error("User onboarding error:", userError);

            const { data: cycleSettings, error: cycleError } = await supabase
                .from("user_cycle_settings")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (cycleError) console.error("Cycle settings error:", cycleError);

            const today = new Date().toISOString().split("T")[0];
            const { data: dailyPlan, error: planError } = await supabase
                .from("daily_plans")
                .select("*")
                .eq("user_id", user.id)
                .eq("date", today)
                .maybeSingle();

            if (planError) console.error("Daily plan error:", planError);

            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

            const { data: dailyLogs, error: logsError } = await supabase
                .from("daily_logs")
                .select("*")
                .eq("user_id", user.id)
                .gte("date", pastDate.toISOString().split("T")[0])
                .order("date", { ascending: false });

            if (logsError) console.error("Daily logs error:", logsError);

            const cycleLength = cycleSettings?.cycle_length_days || 28;
            const periodLength = cycleSettings?.period_length_days || 5;

            const settings: CycleSettings = {
                last_period_start: cycleSettings?.last_period_start || "",
                cycle_length_days: cycleLength,
                period_length_days: periodLength
            };

            const monthLogs: Record<string, DailyLog> = {};
            (dailyLogs || []).forEach((log: any) => {
                if (log?.date) {
                    monthLogs[log.date] = { date: log.date, is_period: log.is_period };
                }
            });

            const phaseResult = calculatePhase(new Date(), settings, monthLogs);
            const phase = phaseResult.phase || "Menstrual";
            const currentDay = phaseResult.day || 1;

            const cycleData = {
                phase,
                cycle_day: currentDay,
                cycle_length: cycleLength,
                period_length: periodLength,
                last_period_start: cycleSettings?.last_period_start,
                is_irregular: cycleSettings?.is_irregular || false,

                todays_plan: dailyPlan
                    ? {
                        plan_content: dailyPlan.plan_content,
                        symptoms: dailyPlan.symptoms,
                        flow_intensity: dailyPlan.flow_intensity,
                        created_at: dailyPlan.created_at,
                        updated_at: dailyPlan.updated_at,
                    }
                    : null,

                // NOTE: You said you don't want username/email. DOB is not username/email,
                // but it's sensitive. Keep only if you truly need it for advice.
                date_of_birth: userData?.date_of_birth,
                height: userData?.height,
                weight: userData?.weight,
                activity_level: userData?.activity_level,
                dietary_preferences: userData?.dietary_preferences || [],
                metabolic_conditions: userData?.metabolic_conditions || [],
                primary_goal: userData?.primary_goal || "General wellness",
                tracker_mode: userData?.tracker_mode,

                recent_logs: dailyLogs || [],
                created_at: userData?.created_at,
            };

            // Store both local + safe versions
            cycleDataRef.current = cycleData;
            safeCycleDataRef.current = sanitizeCycleData(cycleData);

            return cycleData;
        } catch (error) {
            console.error("Error fetching cycle data:", error);

            const fallback = {
                phase: "Unknown",
                cycle_day: 1,
                error: "Could not fetch cycle data. Please make sure you're logged in and have completed onboarding.",
            };

            cycleDataRef.current = fallback;
            safeCycleDataRef.current = sanitizeCycleData(fallback);

            return fallback;
        }
    };

    const startAgent = async () => {
        try {
            setAgentStatus("initializing");

            const cycleData = await fetchCycleData();
            cycleDataRef.current = cycleData;
            safeCycleDataRef.current = sanitizeCycleData(cycleData);

            const { Conversation } = await import("@11labs/client");

            const conversation = await Conversation.startSession({
                agentId: "agent_6601kce0j95kfrxvmgk745zjsjqt",
                connectionType: "websocket",

                onConnect: () => {
                    setAgentStatus("connected");
                    setIsAgentActive(true);
                    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: newId,
                            role: "assistant",
                            content:
                                "Voice agent connected! I can now hear you. Tell me what you'd like to know about your cycle.",
                        },
                    ]);
                },

                onDisconnect: () => {
                    setAgentStatus("disconnected");
                    setIsAgentActive(false);
                    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: newId,
                            role: "assistant",
                            content:
                                "Voice conversation ended. Feel free to continue chatting with text or start another voice session!",
                        },
                    ]);
                },

                onError: (error) => {
                    console.error("Agent error:", error);
                    setAgentStatus("error");
                    setIsAgentActive(false);
                    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: newId,
                            role: "assistant",
                            content: "Sorry, there was an error with the voice connection. Please try again.",
                        },
                    ]);
                },

                onMessage: (message) => {
                    if (message.source === "ai" && message.message) {
                        const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
                        setMessages((prev) => [
                            ...prev,
                            {
                                id: newId,
                                role: "assistant",
                                content: stripEmojis(message.message)
                            },
                        ]);
                    }
                    if (message.source === "user" && message.message) {
                        const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
                        setMessages((prev) => [
                            ...prev,
                            { id: newId, role: "user", content: message.message },
                        ]);
                    }
                },

                clientTools: {
                    getCycleStatus: async () => {
                        // Only sanitized data leaves the app
                        const safe = safeCycleDataRef.current ?? sanitizeCycleData(cycleDataRef.current ?? {});
                        return JSON.stringify(safe);
                    },
                },
            });

            conversationRef.current = conversation;
        } catch (error) {
            console.error("Error starting agent:", error);
            setAgentStatus("error");
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "Could not start voice agent. Please check your microphone permissions and try again.",
                },
            ]);
        }
    };

    const stopAgent = async () => {
        if (conversationRef.current) {
            await conversationRef.current.endSession();
            conversationRef.current = null;
        }
        setIsAgentActive(false);
        setAgentStatus("idle");
    };

    const submitFeedback = async (assistantMsg: Message, rating: 1 | -1) => {
        try {
            // Optimistic UI update
            setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsg.id ? { ...m, feedback: rating } : m))
            );

            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();

            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) throw new Error("User not authenticated");

            // Find the nearest previous user message as "user_prompt" (optional)
            const idx = messages.findIndex((m) => m.id === assistantMsg.id);
            let userPrompt: string | null = null;
            for (let i = idx - 1; i >= 0; i--) {
                if (messages[i]?.role === "user") {
                    userPrompt = messages[i].content;
                    break;
                }
            }

            const { error } = await supabase
                .from("chat_message_feedback")
                .upsert(
                    {
                        user_id: user.id,
                        session_id: sessionIdRef.current,
                        assistant_message_id: assistantMsg.id,
                        assistant_content: assistantMsg.content,
                        user_prompt: userPrompt,
                        rating,
                    },
                    { onConflict: "user_id,session_id,assistant_message_id" }
                );

            if (error) throw error;
        } catch (e) {
            console.error("Feedback error:", e);
            // rollback UI if you want
            setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsg.id ? { ...m, feedback: null } : m))
            );
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
        const newUserMessage: Message = {
            id: newId,
            role: "user",
            content: inputValue,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        const messageText = inputValue;
        setInputValue("");
        setIsTyping(true);

        try {
            if (!cycleDataRef.current) {
                await fetchCycleData();
            }

            const safe = safeCycleDataRef.current ?? sanitizeCycleData(cycleDataRef.current ?? {});

            // Security: Only send user and assistant messages to the server
            // The server will inject the system prompt
            const chatMessages = messages
                .filter(m => m.role === "user" || m.role === "assistant")
                .map(m => ({ role: m.role, content: m.content }));

            // Call YOUR server route (not Groq directly)
            const response = await fetch("/api/groq-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: chatMessages,
                    safeData: safe,
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API error: ${response.status} ${errText}`);
            }

            const data = await response.json();
            const aiResponseRaw =
                data?.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";

            // Extra layer of protection: strip any emojis that the model might have still included
            const aiResponse = stripEmojis(aiResponseRaw);
            const newAiId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;

            setMessages((prev) => [
                ...prev,
                { id: newAiId, role: "assistant", content: aiResponse },
            ]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
            setMessages((prev) => [
                ...prev,
                {
                    id: errorId,
                    role: "assistant",
                    content: "Sorry, I couldn't process your message. Please try again or use the voice feature.",
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white md:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
                        <img
                            src="/images/rove_logo_updated.png"
                            alt="Rove AI"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 leading-none">Rove AI</h3>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                            Cycle Assistant
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isAgentActive ? (
                        <Button
                            onClick={startAgent}
                            disabled={agentStatus === "initializing"}
                            className="rounded-full px-4 py-2 bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-colors text-sm flex items-center gap-2 shadow-sm"
                        >
                            <Phone className="w-4 h-4" />
                            {agentStatus === "initializing" ? "Connecting..." : "Call rove"}
                        </Button>
                    ) : (
                        <Button
                            onClick={stopAgent}
                            className="rounded-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white shadow-lg text-sm flex items-center gap-2 animate-pulse"
                        >
                            <PhoneOff className="w-4 h-4" />
                            End Call
                        </Button>
                    )}

                    {onClose && (
                        <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800">
                            Close
                        </button>
                    )}
                </div>
            </div>

            {isAgentActive && (
                <div className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-200">
                    <div className="flex items-center gap-2 text-sm text-pink-700">
                        <Mic className="w-4 h-4 animate-pulse" />
                        <span className="font-medium">Voice chat active - I'm listening...</span>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex gap-3 max-w-[85%]",
                            message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                message.role === "user"
                                    ? "bg-gray-800 text-white"
                                    : "bg-white text-pink-500 border border-gray-200"
                            )}
                        >
                            {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        <div className="flex flex-col gap-2">
                            <div
                                className={cn(
                                    "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                    message.role === "user"
                                        ? "bg-gray-800 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                                )}
                            >
                                {message.content}
                            </div>

                            {message.role === "assistant" && (
                                <div className="flex items-center gap-2 pl-1">
                                    <button
                                        type="button"
                                        onClick={() => submitFeedback(message, 1)}
                                        className={cn(
                                            "p-1.5 rounded-full border transition",
                                            message.feedback === 1
                                                ? "bg-green-50 border-green-200 text-green-700"
                                                : "bg-white border-gray-200 text-gray-500 hover:text-gray-800"
                                        )}
                                        aria-label="Helpful"
                                        title="Helpful"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => submitFeedback(message, -1)}
                                        className={cn(
                                            "p-1.5 rounded-full border transition",
                                            message.feedback === -1
                                                ? "bg-red-50 border-red-200 text-red-700"
                                                : "bg-white border-gray-200 text-gray-500 hover:text-gray-800"
                                        )}
                                        aria-label="Not helpful"
                                        title="Not helpful"
                                    >
                                        <ThumbsDown className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 mr-auto max-w-[85%]"
                    >
                        <div className="w-8 h-8 rounded-full bg-white text-pink-500 border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Ask about your cycle..."
                        className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-gray-400"
                    />
                    <Button
                        onClick={handleSendMessage}
                        size="icon"
                        disabled={!inputValue.trim() || isTyping}
                        className="rounded-full w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
