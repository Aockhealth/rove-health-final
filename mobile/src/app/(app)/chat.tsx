import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  RotateCcw,
  Send,
  Phone,
  Utensils,
  Activity,
  Sparkles,
  Info,
  AlertCircle,
  Heart,
} from 'lucide-react-native';
import { sendChatMessage, type ChatMessage } from '../../lib/api';
import {
  CharLimitIndicator,
  PromptCountIndicator,
  MAX_PROMPT_CHARS,
  MAX_PROMPTS_PER_SESSION,
  loadPromptCount,
  savePromptCount,
} from '../../components/ui/PromptLimitIndicator';

// Mirrors frontend/src/components/cycle-sync/ChatInterface.tsx's constants —
// same storage keys/TTL, so the two clients don't collide if a user somehow
// shares storage, and so the session behavior (24h expiry) matches.
const CHAT_STORAGE_KEY = 'rove_chat_session';
const CHAT_PROMPT_COUNT_KEY = 'rove_chat_prompt_count';
const CHAT_EXPIRY_MS = 24 * 60 * 60 * 1000;

const SUGGESTIONS = ['How am I feeling today?', 'What should I eat?', 'Suggest a workout'];

interface DisplayMessage extends ChatMessage {
  id: string;
  structuredPayload?: any;
  safety?: any;
}

async function loadSession(): Promise<DisplayMessage[] | null> {
  try {
    const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const { messages, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < CHAT_EXPIRY_MS && Array.isArray(messages) && messages.length > 0) {
        return messages;
      }
      await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
    }
  } catch { }
  return null;
}

async function saveSession(messages: DisplayMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ messages, timestamp: Date.now() }));
  } catch { }
}

function StructuredCard({
  icon,
  title,
  subtitle,
  content,
  footer,
  bg,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: string;
  footer?: string;
  bg: string;
  iconColor: string;
}) {
  return (
    <View className="p-4 rounded-2xl border mb-2.5" style={{ backgroundColor: bg, borderColor: `${iconColor}20` }}>
      <View className="flex-row items-center mb-2">
        <View className="p-1.5 rounded-lg bg-white/80 mr-2">{icon}</View>
        <Text className="text-[10px] font-bold uppercase tracking-wider text-rove-stone">{title}</Text>
      </View>
      <Text className="text-sm font-bold text-rove-charcoal mb-0.5">{subtitle}</Text>
      <Text className="text-xs text-rove-stone leading-relaxed">{content}</Text>
      {footer ? (
        <View className="mt-2 pt-2 border-t border-black/5 flex-row items-start">
          <Heart size={10} color="#A8A29E" style={{ marginTop: 2, marginRight: 5 }} />
          <Text className="text-[10px] text-rove-stone/70 italic flex-1 leading-tight">{footer}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Renders an assistant turn — either the raw narrative, or (when the model
// returned one) the structured Nutrition/Movement/Lifestyle/Supplement cards
// + safety banner, matching frontend/src/components/cycle-sync/
// StructuredResponseRenderer.tsx.
function AssistantContent({ message }: { message: DisplayMessage }) {
  const payload = message.structuredPayload;
  if (!payload) {
    return <Text className="text-sm text-rove-charcoal leading-5">{message.content}</Text>;
  }

  const { nutrition, movement, lifestyle, supplement_spotlight, safety, phase_context } = payload;
  const narrative = message.content !== 'Structured response generated.' ? message.content : phase_context || '';

  return (
    <View>
      {narrative ? <Text className="text-sm text-rove-charcoal leading-5 mb-3">{narrative}</Text> : null}

      {nutrition ? (
        <StructuredCard
          icon={<Utensils size={14} color="#EA8C55" />}
          title="Nutrition Highlight"
          subtitle={nutrition.meal}
          content={nutrition.reason}
          bg="#FFF4EA"
          iconColor="#EA8C55"
        />
      ) : null}
      {movement ? (
        <StructuredCard
          icon={<Activity size={14} color="#5B8DEF" />}
          title="Movement Recommendation"
          subtitle={movement.activity}
          content={movement.reason}
          bg="#EEF3FE"
          iconColor="#5B8DEF"
        />
      ) : null}
      {lifestyle ? (
        <StructuredCard
          icon={<Sparkles size={14} color="#A876D6" />}
          title="Lifestyle Tip"
          subtitle={lifestyle.habit}
          content={lifestyle.reason}
          bg="#F6EEFC"
          iconColor="#A876D6"
        />
      ) : null}
      {supplement_spotlight ? (
        <StructuredCard
          icon={<Info size={14} color="#4CAF50" />}
          title="Supplement Spotlight"
          subtitle={supplement_spotlight.nutrient_or_herb}
          content={supplement_spotlight.reason}
          footer={supplement_spotlight.safety_note}
          bg="#EEF9EE"
          iconColor="#4CAF50"
        />
      ) : null}

      {safety && safety.status !== 'normal' ? (
        <View className="p-3 rounded-xl bg-red-50 border border-red-100 flex-row items-start mt-1">
          <AlertCircle size={14} color="#D32F2F" style={{ marginTop: 1, marginRight: 8 }} />
          <Text className="text-xs text-red-800 leading-relaxed font-medium flex-1">{safety.message}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedMessages, savedCount] = await Promise.all([
        loadSession(),
        loadPromptCount(CHAT_PROMPT_COUNT_KEY),
      ]);
      if (savedMessages) setMessages(savedMessages);
      setPromptCount(savedCount);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (hydrated && messages.length > 0) {
      saveSession(messages);
    }
  }, [messages, hydrated]);

  const isOverChars = input.length > MAX_PROMPT_CHARS;
  const isLimitReached = promptCount >= MAX_PROMPTS_PER_SESSION;
  const canSend = input.trim().length > 0 && !isOverChars && !isLimitReached && !isSending;

  const handleNewChat = () => {
    setMessages([]);
    AsyncStorage.removeItem(CHAT_STORAGE_KEY);
  };

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isOverChars || isLimitReached || isSending) return;

    const userMessage: DisplayMessage = { id: `${Date.now()}-user`, role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    const newCount = promptCount + 1;
    setPromptCount(newCount);
    savePromptCount(CHAT_PROMPT_COUNT_KEY, newCount);

    try {
      const payload: ChatMessage[] = nextMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(payload);
      const assistantMessage: DisplayMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: res.ai.narrative,
        structuredPayload: res.ai.structuredPayload,
        safety: res.ai.safety,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not reach Rove. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-[#FAF9F6]" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-rove-stone/10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={22} color="#2D2420" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Rove</Text>
          <Text className="text-[9px] font-bold uppercase tracking-widest text-rove-stone -mt-0.5">Cycle Wellness</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                "Voice chat with Rove is on its way!"
              )
            }
            className="p-2 mr-1 rounded-full bg-rove-stone/10"
          >
            <Phone size={16} color="#A8A29E" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNewChat} className="p-2">
            <RotateCcw size={18} color="#A8A29E" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {showWelcome && (
            <View className="bg-white rounded-2xl p-5 border border-rove-stone/10 mb-4">
              <Text className="text-base font-bold text-rove-charcoal mb-2">👋 Welcome to Rove</Text>
              <Text className="text-sm text-rove-charcoal leading-5 mb-3">
                I am your personal cycle and hormone wellness companion. I can help you understand your body's
                natural rhythms, manage symptoms, and optimize your lifestyle based on your unique cycle phase.
              </Text>
              <Text className="text-xs font-bold text-rove-charcoal mb-2">Here are some things you can ask me:</Text>
              {[
                'Why am I feeling so tired today during my Luteal phase?',
                'What should I eat to help with my PCOS symptoms?',
                'Can you suggest a gentle workout for my menstrual phase?',
              ].map((line, i) => (
                <View key={i} className="flex-row items-start mb-1.5">
                  <Text className="text-rove-stone mr-2">•</Text>
                  <Text className="text-xs text-rove-stone italic flex-1 leading-5">{line}</Text>
                </View>
              ))}
              <View className="mt-3 pt-3 border-t border-rove-stone/10">
                <Text className="text-[11px] text-rove-stone leading-5">
                  <Text className="font-bold">Note: </Text>
                  I am an AI wellness guide, not a doctor. If you are experiencing severe pain, heavy bleeding, or a
                  medical emergency, please consult a healthcare professional.
                </Text>
              </View>

              <View className="flex-row flex-wrap mt-4" style={{ marginHorizontal: -4 }}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleSend(s)}
                    className="px-3 py-2 rounded-full bg-[#C97B7B]/10 border border-[#C97B7B]/20 m-1"
                  >
                    <Text className="text-xs font-bold text-[#C97B7B]">{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((m) => (
            <View
              key={m.id}
              className={`mb-3 max-w-[88%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
            >
              <View
                className={`p-3.5 rounded-2xl ${m.role === 'user' ? 'bg-[#C97B7B]' : 'bg-white border border-rove-stone/10'}`}
              >
                {m.role === 'user' ? (
                  <Text className="text-sm text-white leading-5">{m.content}</Text>
                ) : (
                  <AssistantContent message={m} />
                )}
              </View>
            </View>
          ))}

          {isSending && (
            <View className="self-start bg-white border border-rove-stone/10 rounded-2xl p-3.5 mb-3">
              <ActivityIndicator size="small" color="#C97B7B" />
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View className="px-4 pt-2 pb-3 border-t border-rove-stone/10 bg-[#FAF9F6]">
          <View className="flex-row items-center bg-white border border-rove-stone/15 rounded-full px-4 py-1 mb-2">
            <TextInput
              value={input}
              onChangeText={(t) => setInput(t.slice(0, MAX_PROMPT_CHARS))}
              placeholder="Ask Rove anything..."
              placeholderTextColor="#A8A29E99"
              maxLength={MAX_PROMPT_CHARS}
              className="flex-1 text-sm text-rove-charcoal py-2.5"
              multiline={false}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!canSend}
              className="w-9 h-9 rounded-full items-center justify-center ml-2"
              style={{ backgroundColor: canSend ? '#C97B7B' : '#D6D3D1' }}
            >
              <Send size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center justify-between px-1">
            <CharLimitIndicator charCount={input.length} />
            <PromptCountIndicator promptCount={promptCount} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
