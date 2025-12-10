"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function ChatInterface({ onClose }: { onClose?: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hi Sarah! I'm Rove AI. I see you're in your Follicular phase. How can I help you optimize your energy today?",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue("");
        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            const responses = [
                "That's a great question. Based on your current phase, I'd recommend focusing on high-protein meals and complex carbs.",
                "Your energy levels are naturally higher right now. It's the perfect time for that HIIT workout!",
                "Try incorporating some leafy greens and citrus fruits to support your rising estrogen levels.",
                "Make sure to stay hydrated! Your body is working hard to prepare for ovulation.",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const newAiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: randomResponse,
            };

            setMessages((prev) => [...prev, newAiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-white md:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-rove-stone/10 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rove-red to-rove-charcoal flex items-center justify-center text-white shadow-lg">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-heading text-lg text-rove-charcoal leading-none">Rove AI</h3>
                        <p className="text-[10px] text-rove-stone font-medium uppercase tracking-wider">Cycle Assistant</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="md:hidden text-rove-stone hover:text-rove-charcoal">
                        Close
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-rove-cream/10">
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
                                message.role === "user" ? "bg-rove-charcoal text-white" : "bg-white text-rove-red border border-rove-stone/10"
                            )}
                        >
                            {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div
                            className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                message.role === "user"
                                    ? "bg-rove-charcoal text-white rounded-tr-none"
                                    : "bg-white text-rove-charcoal border border-rove-stone/10 rounded-tl-none"
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
                        <div className="w-8 h-8 rounded-full bg-white text-rove-red border border-rove-stone/10 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-rove-stone/10 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-rove-stone/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-rove-stone/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-rove-stone/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-rove-stone/10">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about your cycle..."
                        className="flex-1 bg-rove-cream/30 border border-rove-stone/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rove-charcoal/10 transition-all placeholder:text-rove-stone/50"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!inputValue.trim() || isTyping}
                        className="rounded-full w-12 h-12 bg-rove-charcoal hover:bg-rove-charcoal/90 text-white shadow-lg shadow-rove-charcoal/20 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
