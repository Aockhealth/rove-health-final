import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Send, User, Bot, Phone, PhoneOff, Mic, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { calculatePhase, type CycleSettings, type DailyLog } from "@shared/cycle/phase";

const LOG_WINDOW_DAYS = 90;

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    feedback?: 1 | -1 | null; // 👍 = 1, 👎 = -1
    missingData?: string[];
    suggestions?: string[];
}

const MISSING_DATA_LABELS: Record<string, string> = {
    "last_period_date_or_cycle_day": "When did your last period start?",
    "average_cycle_length": "How long is your typical cycle?",
    "current_symptoms": "What symptoms are you experiencing?",
    "diet_preference": "What's your dietary preference?"
};

const CHAT_STORAGE_KEY = "rove_chat_session";
const CHAT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours


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



const DEFAULT_MESSAGES: Message[] = [
    {
        id: "system-intro",
        role: "assistant",
        content: `### 👋 Welcome to Rove\n\nI am your personal cycle and hormone wellness companion. I can help you understand your body's natural rhythms, manage symptoms, and optimize your lifestyle based on your unique cycle phase.\n\n**Here are some things you can ask me:**\n- *"Why am I feeling so tired today during my Luteal phase?"*\n- *"What should I eat to help with my PCOS symptoms?"*\n- *"Can you suggest a gentle workout for my menstrual phase?"*\n\n> **Note:** I am an AI wellness guide, not a doctor. If you are experiencing severe pain, heavy bleeding, or a medical emergency, please consult a healthcare professional.`,
        suggestions: ["How am I feeling today?", "What should I eat?", "Suggest a workout"]
    }
];

export function ChatInterface({ onClose }: { onClose?: () => void }) {
    const [messages, setMessages] = useState<Message[]>(() => {
        // Restore from localStorage if a valid session exists
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(CHAT_STORAGE_KEY);
                if (stored) {
                    const { messages: savedMessages, timestamp } = JSON.parse(stored);
                    if (Date.now() - timestamp < CHAT_EXPIRY_MS && Array.isArray(savedMessages) && savedMessages.length > 1) {
                        return savedMessages;
                    }
                    localStorage.removeItem(CHAT_STORAGE_KEY);
                }
            } catch { /* ignore corrupt storage */ }
        }
        return DEFAULT_MESSAGES;
    });
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

    // Persist messages to localStorage on every update
    useEffect(() => {
        if (typeof window !== "undefined" && messages.length > 1) {
            try {
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
                    messages,
                    timestamp: Date.now()
                }));
            } catch { /* storage full or unavailable */ }
        }
    }, [messages]);

    const handleNewChat = () => {
        if (typeof window !== "undefined") localStorage.removeItem(CHAT_STORAGE_KEY);
        setMessages(DEFAULT_MESSAGES);
    };

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
                height_cm: userData?.height_cm,
                weight_kg: userData?.weight_kg,
                goals: userData?.goals || [],
                conditions: userData?.conditions || [],
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
                                content: message.message
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
            // Security: Only send user and assistant messages to the server
            // The backend's buildUnifiedContext() handles all DB queries — no client-side fetch needed
            const chatMessages = messages
                .filter(m => m.role === "user" || m.role === "assistant")
                .map(m => ({ role: m.role, content: m.content }));

            // Explicitly append the new message, because React state `messages` is stale here
            chatMessages.push({ role: "user", content: messageText });

            // Call YOUR server route — backend handles all context assembly
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: chatMessages,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API error: ${response.status} ${errText}`);
            }

            const data = await response.json();
            const aiResponse =
                data?.ai?.narrative ||
                data?.choices?.[0]?.message?.content ||
                (data?.ai?.safety?.reason as string | undefined) ||
                "I'm sorry, I couldn't process that. Please try again.";
            const newAiId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;

            // Extract missing data prompts and suggestion chips from structured payload
            const payload = data?.ai?.structuredPayload;
            const missingData = Array.isArray(payload?.missing_data) ? payload.missing_data : undefined;
            const suggestions: string[] = [];
            if (payload?.check_in_question) suggestions.push(payload.check_in_question);
            if (payload?.modules_used?.includes("nutrition")) suggestions.push("Tell me more about this meal");
            if (payload?.modules_used?.includes("movement")) suggestions.push("What exercise do you suggest?");
            if (!payload?.modules_used?.includes("nutrition")) suggestions.push("What should I eat today?");
            if (!payload?.modules_used?.includes("movement")) suggestions.push("Suggest a workout for me");

            setMessages((prev) => [
                ...prev,
                {
                    id: newAiId,
                    role: "assistant",
                    content: aiResponse,
                    missingData: missingData?.length ? missingData : undefined,
                    suggestions: suggestions.length ? suggestions.slice(0, 3) : undefined
                },
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
        <div className="flex flex-col h-full md:rounded-3xl overflow-hidden relative" style={{ backgroundColor: '#FAF9F6' }}>
            {/* Subtle organic blob accents */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.07] pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--color-phase-menstrual) 0%, transparent 70%)' }} />
            <div className="absolute bottom-20 left-0 w-48 h-48 rounded-full opacity-[0.05] pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--color-phase-luteal) 0%, transparent 70%)' }} />

            {/* Header — Glassmorphism */}
            <div className="px-5 py-4 flex justify-between items-center sticky top-0 z-10"
                style={{
                    backgroundColor: 'rgba(250, 249, 246, 0.8)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderBottom: '1px solid rgba(45, 36, 32, 0.06)'
                }}>
                <div className="flex items-center gap-1">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <img
                            src="/images/rove_icon_transparent.png"
                            alt="Rove AI"
                            className="w-full h-full object-contain scale-[1.35] drop-shadow-sm"
                        />
                    </div>
                    <div>
                        <h3 className="font-serif text-xl leading-none tracking-tight" style={{ color: '#2D2420' }}>Rove</h3>
                        <p className="text-[10px] font-medium uppercase mt-0.5" style={{ color: '#A8A29E', letterSpacing: '0.15em' }}>
                            Cycle Wellness
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {messages.length > 1 && (
                        <button
                            onClick={handleNewChat}
                            className="p-2.5 rounded-full transition-all duration-200"
                            style={{ color: '#A8A29E' }}
                            title="New Chat"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                    {!isAgentActive ? (
                        <Button
                            onClick={startAgent}
                            disabled={agentStatus === "initializing"}
                            className="rounded-full px-4 py-2 text-sm flex items-center gap-2 transition-all duration-200"
                            style={{
                                backgroundColor: 'rgba(45, 36, 32, 0.06)',
                                color: '#2D2420',
                                border: '1px solid rgba(45, 36, 32, 0.1)'
                            }}
                        >
                            <Phone className="w-3.5 h-3.5" />
                            {agentStatus === "initializing" ? "Connecting..." : "Call"}
                        </Button>
                    ) : (
                        <Button
                            onClick={stopAgent}
                            className="rounded-full px-4 py-2 text-white text-sm flex items-center gap-2 animate-pulse shadow-lg transition-all"
                            style={{ backgroundColor: '#2D2420' }}
                        >
                            <PhoneOff className="w-3.5 h-3.5" />
                            End
                        </Button>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="md:hidden p-2 rounded-full transition-colors" style={{ color: '#A8A29E' }}>
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {isAgentActive && (
                <div className="px-5 py-2.5"
                    style={{
                        background: 'linear-gradient(135deg, rgba(45, 36, 32, 0.03) 0%, rgba(168, 162, 158, 0.06) 100%)',
                        borderBottom: '1px solid rgba(45, 36, 32, 0.06)'
                    }}>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#2D2420' }}>
                        <Mic className="w-4 h-4 animate-pulse" />
                        <span className="font-medium">Voice active — speak to Rove</span>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 relative">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={cn(
                            "flex gap-3 max-w-[88%]",
                            message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        {/* Avatar */}
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={message.role === "user"
                                ? { backgroundColor: '#2D2420', color: '#FDFCFB' }
                                : {
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    border: '1px solid rgba(168, 162, 158, 0.25)',
                                    color: '#A8A29E'
                                }
                            }
                        >
                            {message.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>

                        {/* Message Content */}
                        <div className="flex flex-col gap-2">
                            <div
                                className={cn(
                                    "px-4 py-3 text-sm leading-relaxed",
                                    message.role === "user"
                                        ? "rounded-2xl rounded-tr-sm"
                                        : "rounded-2xl rounded-tl-sm"
                                )}
                                style={message.role === "user"
                                    ? { backgroundColor: '#2D2420', color: '#FDFCFB' }
                                    : {
                                        backgroundColor: 'rgba(255, 255, 255, 0.75)',
                                        backdropFilter: 'blur(16px)',
                                        WebkitBackdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(255, 255, 255, 0.9)',
                                        boxShadow: '0 2px 16px -2px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255,255,255,0.5)',
                                        color: '#2D2420'
                                    }
                                }
                            >
                                {message.role === "assistant" ? (
                                    <div className="text-sm max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h3: ({ node, ...props }) => <h3 className="font-serif text-base font-semibold mt-4 mb-2 first:mt-0 tracking-tight" style={{ color: '#2D2420' }} {...props} />,
                                                p: ({ node, ...props }) => <p className="leading-relaxed mb-3 last:mb-0" style={{ color: '#2D2420' }} {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc list-outside pl-4 space-y-1.5 mt-2 mb-3 last:mb-0" style={{ color: '#2D2420' }} {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold" style={{ color: '#1A1A1A' }} {...props} />,
                                                em: ({ node, ...props }) => <em className="italic text-[0.95em]" style={{ color: '#A8A29E' }} {...props} />,
                                                hr: ({ node, ...props }) => <hr className="my-4" style={{ borderColor: 'rgba(45, 36, 32, 0.08)' }} {...props} />,
                                                blockquote: ({ node, ...props }) => (
                                                    <blockquote className="border-l-2 pl-3 my-3 py-1 text-[0.9em] italic rounded-r-lg"
                                                        style={{
                                                            borderColor: '#D4A25F',
                                                            backgroundColor: 'rgba(212, 162, 95, 0.06)',
                                                            color: '#7B82A8'
                                                        }} {...props} />
                                                )
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="text-sm leading-relaxed">{message.content}</div>
                                )}
                            </div>

                            {/* Feedback Buttons */}
                            {message.role === "assistant" && (
                                <div className="flex items-center gap-1.5 pl-1">
                                    <button
                                        type="button"
                                        onClick={() => submitFeedback(message, 1)}
                                        className="p-1.5 rounded-full transition-all duration-200"
                                        style={message.feedback === 1
                                            ? { backgroundColor: 'rgba(141, 170, 157, 0.1)', border: '1px solid rgba(141, 170, 157, 0.25)', color: '#8DAA9D' }
                                            : { border: '1px solid transparent', color: 'rgba(168, 162, 158, 0.4)' }
                                        }
                                        aria-label="Helpful"
                                        title="Helpful"
                                    >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => submitFeedback(message, -1)}
                                        className="p-1.5 rounded-full transition-all duration-200"
                                        style={message.feedback === -1
                                            ? { backgroundColor: 'rgba(175, 107, 107, 0.1)', border: '1px solid rgba(175, 107, 107, 0.25)', color: '#AF6B6B' }
                                            : { border: '1px solid transparent', color: 'rgba(168, 162, 158, 0.4)' }
                                        }
                                        aria-label="Not helpful"
                                        title="Not helpful"
                                    >
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* Missing Data Prompt Cards */}
                            {message.missingData && message.missingData.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-0.5">
                                    {message.missingData.map((key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setInputValue(MISSING_DATA_LABELS[key] || key)}
                                            className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-[1.02]"
                                            style={{
                                                backgroundColor: 'rgba(212, 162, 95, 0.06)',
                                                border: '1px solid rgba(212, 162, 95, 0.15)',
                                                color: '#C49555'
                                            }}
                                        >
                                            ✦ {MISSING_DATA_LABELS[key] || key}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Quick-Reply Suggestion Chips */}
                            {message.suggestions && message.suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-0.5">
                                    {message.suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setInputValue(suggestion);
                                                setTimeout(() => {
                                                    const form = document.querySelector('[data-chat-input]') as HTMLInputElement;
                                                    if (form) {
                                                        form.value = suggestion;
                                                        form.dispatchEvent(new Event('input', { bubbles: true }));
                                                    }
                                                }, 50);
                                            }}
                                            className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-[1.02]"
                                            style={{
                                                backgroundColor: 'rgba(45, 36, 32, 0.04)',
                                                border: '1px solid rgba(45, 36, 32, 0.1)',
                                                color: '#2D2420'
                                            }}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 mr-auto max-w-[85%]"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(168, 162, 158, 0.25)',
                                color: '#A8A29E'
                            }}>
                            <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)'
                            }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#A8A29E', animationDelay: '0ms', opacity: 0.5 }} />
                            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#C4B5A8', animationDelay: '150ms', opacity: 0.5 }} />
                            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#A8A29E', animationDelay: '300ms', opacity: 0.5 }} />
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar — Glassmorphism */}
            <div className="px-4 py-3"
                style={{
                    backgroundColor: 'rgba(250, 249, 246, 0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderTop: '1px solid rgba(45, 36, 32, 0.06)'
                }}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        data-chat-input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Ask about your cycle..."
                        className="flex-1 rounded-full px-5 py-3 text-sm transition-all duration-200 focus:outline-none"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid rgba(45, 36, 32, 0.08)',
                            color: '#2D2420',
                            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.02)'
                        }}
                    />
                    <Button
                        onClick={handleSendMessage}
                        size="icon"
                        disabled={!inputValue.trim() || isTyping}
                        className="rounded-full w-11 h-11 text-white shadow-md disabled:opacity-40 disabled:shadow-none transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: !inputValue.trim() || isTyping ? '#A8A29E' : '#2D2420',
                        }}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

