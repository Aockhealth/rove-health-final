import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Send, User, Bot, Phone, PhoneOff, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Fetch user's current cycle data from Supabase
    const fetchCycleData = async () => {
        try {
            // Import Supabase client - adjust the import path based on your project structure
            const { createClient } = await import('@/utils/supabase/client');
            const supabase = createClient();

            // Get authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error("Auth error:", authError);
                throw new Error("User not authenticated");
            }

            console.log("Authenticated user:", user.id);

            // Fetch user profile (note: profiles table uses 'id' column, not 'user_id')
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                console.error("Profile error:", profileError);
            }

            console.log("Profile data:", profileData);

            // Fetch user onboarding data
            const { data: userData, error: userError } = await supabase
                .from('user_onboarding')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (userError) {
                console.error("User onboarding error:", userError);
            }

            console.log("User onboarding data:", userData);

            // Fetch user cycle settings
            const { data: cycleSettings, error: cycleError } = await supabase
                .from('user_cycle_settings')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (cycleError) {
                console.error("Cycle settings error:", cycleError);
            }

            console.log("Cycle settings:", cycleSettings);

            // Fetch today's daily plan (use maybeSingle since there might not be a plan for today)
            const today = new Date().toISOString().split('T')[0];
            const { data: dailyPlan, error: planError } = await supabase
                .from('daily_plans')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', today)
                .maybeSingle();

            if (planError) {
                console.error("Daily plan error:", planError);
            }

            console.log("Daily plan:", dailyPlan);

            // Fetch recent daily logs
            const { data: dailyLogs, error: logsError } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(7);

            if (logsError) {
                console.error("Daily logs error:", logsError);
            }

            console.log("Daily logs:", dailyLogs);

            // Calculate current cycle day
            const lastPeriodStart = new Date(cycleSettings?.last_period_start || userData?.date_of_birth || new Date());
            const today_date = new Date();
            const daysSinceLastPeriod = Math.floor((today_date.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
            const cycleLength = cycleSettings?.cycle_length_days || 28;
            const periodLength = cycleSettings?.period_length_days || 5;
            const currentDay = (daysSinceLastPeriod % cycleLength) + 1;

            // Determine phase
            let phase = "Unknown";
            if (currentDay >= 1 && currentDay <= periodLength) {
                phase = "Menstrual";
            } else if (currentDay > periodLength && currentDay <= Math.floor(cycleLength * 0.45)) {
                phase = "Follicular";
            } else if (currentDay > Math.floor(cycleLength * 0.45) && currentDay <= Math.floor(cycleLength * 0.55)) {
                phase = "Ovulatory";
            } else {
                phase = "Luteal";
            }

            // Compile comprehensive cycle data
            const cycleData = {
                user_id: user.id,
                email: profileData?.email || user.email,
                full_name: profileData?.full_name || user.email?.split('@')[0] || "User",

                // Cycle information
                phase: phase,
                cycle_day: currentDay,
                cycle_length: cycleLength,
                period_length: periodLength,
                last_period_start: cycleSettings?.last_period_start,
                is_irregular: cycleSettings?.is_irregular || false,

                // Today's plan
                todays_plan: dailyPlan ? {
                    plan_content: dailyPlan.plan_content,
                    symptoms: dailyPlan.symptoms,
                    flow_intensity: dailyPlan.flow_intensity,
                    created_at: dailyPlan.created_at,
                    updated_at: dailyPlan.updated_at
                } : null,

                // User profile
                date_of_birth: userData?.date_of_birth,
                height: userData?.height,
                weight: userData?.weight,
                activity_level: userData?.activity_level,
                dietary_preferences: userData?.dietary_preferences || [],
                metabolic_conditions: userData?.metabolic_conditions || [],
                primary_goal: userData?.primary_goal || "General wellness",
                tracker_mode: userData?.tracker_mode,

                // Recent logs (last 7 days)
                recent_logs: dailyLogs || [],

                created_at: userData?.created_at
            };

            console.log("Final cycle data:", cycleData);
            return cycleData;

        } catch (error) {
            console.error("Error fetching cycle data:", error);
            return {
                phase: "Unknown",
                cycle_day: 1,
                error: "Could not fetch cycle data. Please make sure you're logged in and have completed onboarding."
            };
        }
    };

    // Start 11labs conversation
    const startAgent = async () => {
        try {
            setAgentStatus("initializing");

            // Fetch current cycle data
            const cycleData = await fetchCycleData();
            cycleDataRef.current = cycleData;

            // Import 11labs SDK
            const { Conversation } = await import('@11labs/client');

            const conversation = await Conversation.startSession({
                agentId: "agent_6601kce0j95kfrxvmgk745zjsjqt",
                connectionType: "websocket",

                onConnect: () => {
                    setAgentStatus("connected");
                    setIsAgentActive(true);

                    const newMessage: Message = {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "🎙️ Voice agent connected! I can now hear you. Tell me what you'd like to know about your cycle.",
                    };
                    setMessages((prev) => [...prev, newMessage]);
                },

                onDisconnect: () => {
                    setAgentStatus("disconnected");
                    setIsAgentActive(false);

                    const newMessage: Message = {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "Voice conversation ended. Feel free to continue chatting with text or start another voice session!",
                    };
                    setMessages((prev) => [...prev, newMessage]);
                },

                onError: (error) => {
                    console.error("Agent error:", error);
                    setAgentStatus("error");
                    setIsAgentActive(false);

                    const newMessage: Message = {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "Sorry, there was an error with the voice connection. Please try again.",
                    };
                    setMessages((prev) => [...prev, newMessage]);
                },

                onMessage: (message) => {
                    // Display agent's responses in the chat
                    if (message.source === 'ai' && message.message) {
                        const newMessage: Message = {
                            id: Date.now().toString(),
                            role: "assistant",
                            content: message.message,
                        };
                        setMessages((prev) => [...prev, newMessage]);
                    }
                    // Also capture user's spoken messages
                    if (message.source === 'user' && message.message) {
                        const newMessage: Message = {
                            id: Date.now().toString(),
                            role: "user",
                            content: message.message,
                        };
                        setMessages((prev) => [...prev, newMessage]);
                    }
                },

                // Handle client tool calls
                clientTools: {
                    getCycleStatus: async () => {
                        console.log("Agent requested cycle status");
                        return JSON.stringify(cycleData);
                    }
                }
            });

            conversationRef.current = conversation;

        } catch (error) {
            console.error("Error starting agent:", error);
            setAgentStatus("error");

            const newMessage: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: "Could not start voice agent. Please check your microphone permissions and try again.",
            };
            setMessages((prev) => [...prev, newMessage]);
        }
    };

    // Stop the agent
    const stopAgent = async () => {
        if (conversationRef.current) {
            await conversationRef.current.endSession();
            conversationRef.current = null;
        }
        setIsAgentActive(false);
        setAgentStatus("idle");
    };

    // Send text message using Groq API
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        const messageText = inputValue;
        setInputValue("");
        setIsTyping(true);

        try {
            // Fetch cycle data if not already fetched
            if (!cycleDataRef.current) {
                cycleDataRef.current = await fetchCycleData();
            }

            // Call Groq API for text messages
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: `You are Rove AI, a supportive and knowledgeable menstrual cycle assistant. You help users understand their cycle phases, provide personalized nutrition and fitness advice, and answer questions about their menstrual health.

Current user data:
${JSON.stringify(cycleDataRef.current, null, 2)}

Guidelines:
- Be warm, empathetic, and encouraging
- Provide specific, actionable advice based on the user's current cycle phase
- Reference their cycle day, phase, and any logged symptoms when relevant
- Keep responses concise (2-3 sentences unless more detail is needed)
- Use emojis sparingly and appropriately
- If asked about medical concerns, advise consulting a healthcare provider`
                        },
                        {
                            role: "user",
                            content: messageText
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.statusText}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";

            const newAiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: aiResponse,
            };

            setMessages((prev) => [...prev, newAiMessage]);
            setIsTyping(false);

        } catch (error) {
            console.error("Error sending message:", error);
            setIsTyping(false);

            const errorMessage: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: "Sorry, I couldn't process your message. Please try again or use the voice feature.",
            };
            setMessages((prev) => [...prev, errorMessage]);
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
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Cycle Assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Voice Agent Button */}
                    {!isAgentActive ? (
                        <Button
                            onClick={startAgent}
                            disabled={agentStatus === "initializing"}
                            className="rounded-full px-4 py-2 bg-purple-100 text-purple-700 
             border border-purple-200 hover:bg-purple-200 
             transition-colors text-sm flex items-center gap-2 shadow-sm"
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

            {/* Voice Status Indicator */}
            {isAgentActive && (
                <div className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-200">
                    <div className="flex items-center gap-2 text-sm text-pink-700">
                        <Mic className="w-4 h-4 animate-pulse" />
                        <span className="font-medium">Voice chat active - I'm listening...</span>
                    </div>
                </div>
            )}

            {/* Messages Area */}
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
                                message.role === "user" ? "bg-gray-800 text-white" : "bg-white text-pink-500 border border-gray-200"
                            )}
                        >
                            {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
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

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
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