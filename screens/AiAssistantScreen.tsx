import MainContainer from "@/components/layouts/MainContainer";
import FeatureGateModal from "@/components/ui/FeatureGateModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import { useSetupProgress } from "@/hooks/useSetupProgress";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { addKeyboardBehavior, cn } from "@/lib/utils";
import { useAskAiMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Toast from "react-native-toast-message";

type AssistantCategory = {
  id: string;
  label: string;
  prompt: string;
};

type BreakdownCategory = {
  id: string;
  label: string;
  amount: string;
  percentage: string;
  color: string;
};

type MessageBase = {
  id: string;
  timestamp: number;
};

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 30) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(timestamp).toLocaleDateString();
};

type AssistantMessage = MessageBase & {
  author: "assistant";
  title?: string;
  body?: string;
  bullets?: string[];
  breakdown?: {
    total: string;
    categories: BreakdownCategory[];
  };
};

type UserMessage = MessageBase & {
  author: "user";
  body: string;
};

type Message = AssistantMessage | UserMessage;

const CATEGORIES: AssistantCategory[] = [
  {
    id: "saving",
    label: "Saving Tips",
    prompt:
      "Give me some practical tips to save more money based on my spending habits.",
  },
  {
    id: "budget",
    label: "Budget Help",
    prompt:
      "Help me create or improve my budget. What categories should I focus on?",
  },
  {
    id: "investment",
    label: "Investment Advice",
    prompt:
      "What are some beginner-friendly investment options I should consider?",
  },
  {
    id: "credit",
    label: "Credit Score",
    prompt:
      "How can I improve my credit score? What factors affect it the most?",
  },
  {
    id: "spending",
    label: "Track Spending",
    prompt: "Analyze my spending patterns and show me where my money is going.",
  },
];

const getInitialMessages = (): Message[] => [
  {
    id: "intro",
    author: "assistant",
    timestamp: Date.now(),
    title:
      "Hello! I'm Bobbie, your AI financial assistant. I'm here to help you manage your finance better. How can I assist you today?",
    bullets: [
      "Track your spending in real-time and show where your money goes 💸",
      "Set up budgets for categories like food, transport, or entertainment 🎯",
      "Remind you of upcoming bills so you never miss a payment 🧾",
      "Suggest smarter saving habits tailored to your lifestyle 💡",
      "Celebrate your milestones to keep you motivated ✨",
    ],
  },
  {
    id: "prompt",
    author: "assistant",
    timestamp: Date.now(),
    body: "Let's get started! Would you like to add your income and expenses first, or set a savings goal to work towards?",
  },
];

const AiAssistantScreen = () => {
  const router = useRouter();
  const { userData } = useSession();
  const { isSetupComplete, steps, currentStepIndex } = useSetupProgress();
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [draftMessage, setDraftMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [, forceUpdate] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (userData?.usageMetrics?.lastInteractionDate) {
      const lastInteraction = new Date(
        userData.usageMetrics.lastInteractionDate,
      ).getTime();
      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;
      if (now - lastInteraction > twelveHours) {
        queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      }
    }
  }, [userData?.usageMetrics?.lastInteractionDate, queryClient]);

  const isLimitReached =
    !isSetupComplete && (userData?.usageMetrics?.aiSessionsCount || 0) >= 2;

  const { startRecording, stopRecording, isRecording, isProcessing } =
    useSpeechRecognition({
      onResult: (text) => {
        setDraftMessage((prev) => (prev ? `${prev} ${text}` : text));
        Toast.show({
          type: "success",
          text1: "Voice input received",
          text2: text,
        });
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Voice recognition error",
          text2: error,
        });
      },
    });

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const askMutation = useAskAiMutation();

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timeoutID);
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = draftMessage.trim();
    if (!text) return;

    const userMsg: UserMessage = {
      id: `user_${Date.now()}`,
      author: "user",
      timestamp: Date.now(),
      body: text,
    };
    setMessages((m) => [...m, userMsg]);
    setDraftMessage("");

    askMutation.mutate(
      { message: text },
      {
        onSuccess: (data) => {
          const assistantMsg: AssistantMessage = {
            id: `assistant_${Date.now()}`,
            author: "assistant",
            timestamp: Date.now(),
            body: data.reply,
          };
          setMessages((m) => [...m, assistantMsg]);
        },
        onError: (err) => {
          const errMsg: AssistantMessage = {
            id: `assistant_err_${Date.now()}`,
            author: "assistant",
            timestamp: Date.now(),
            body: err.message || "Failed to get a response",
          };
          setMessages((m) => [...m, errMsg]);
        },
      },
    );
  }, [draftMessage, askMutation]);

  const handleCategoryPress = useCallback(
    (category: AssistantCategory) => {
      setActiveCategory(category.id);

      const userMsg: UserMessage = {
        id: `user_${Date.now()}`,
        author: "user",
        timestamp: Date.now(),
        body: category.prompt,
      };
      setMessages((m) => [...m, userMsg]);

      askMutation.mutate(
        { message: category.prompt },
        {
          onSuccess: (data) => {
            const assistantMsg: AssistantMessage = {
              id: `assistant_${Date.now()}`,
              author: "assistant",
              timestamp: Date.now(),
              body: data.reply,
            };
            setMessages((m) => [...m, assistantMsg]);
          },
          onError: (err) => {
            const errMsg: AssistantMessage = {
              id: `assistant_err_${Date.now()}`,
              author: "assistant",
              timestamp: Date.now(),
              body: err.message || "Failed to get a response",
            };
            setMessages((m) => [...m, errMsg]);
          },
        },
      );
    },
    [askMutation],
  );

  const handleMicPress = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <MainContainer edges={[]} className="bg-lightMuted">
      <FeatureGateModal
        visible={false}
        featureName="AI Assistant"
        onCompleteSetup={() => {
          if (steps[currentStepIndex]?.route) {
            router.replace(steps[currentStepIndex].route as any);
          }
        }}
        onGoBack={() => router.back()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={addKeyboardBehavior()}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((category) => {
              const isActive = category.id === activeCategory;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(category)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.categoryChip,
                    askMutation.isPending && { opacity: 0.6 },
                  ]}
                  disabled={askMutation.isPending}
                >
                  <Text
                    weight={isActive ? "semibold" : "medium"}
                    className={cn("text-sm text-primary_400")}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.messageStack}>
            {messages.map((message) => {
              if (message.author === "assistant") {
                return (
                  <View key={message.id} style={styles.assistantMessageRow}>
                    <View style={styles.avatar}>
                      <Image
                        tintColor={COLORS.primary_400}
                        source={require("@/assets/icons/ai_bot.svg")}
                        style={{ width: 24, height: 24 }}
                      />
                    </View>
                    <View style={styles.assistantBubble}>
                      {message.title ? (
                        <Text
                          weight="semibold"
                          className="text-sm text-textColor"
                        >
                          {message.title}
                        </Text>
                      ) : null}
                      {message.body ? (
                        <Markdown style={markdownStyles}>
                          {message.body}
                        </Markdown>
                      ) : null}
                      {message.bullets ? (
                        <View style={styles.bulletList}>
                          {message.bullets.map((item) => (
                            <View key={item} style={styles.bulletItem}>
                              <View style={styles.bulletDot} />
                              <Text className="flex-1 text-sm leading-5 text-textColor/80">
                                {item}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {message.breakdown ? (
                        <View style={styles.breakdownCard}>
                          <Text
                            weight="bold"
                            className="text-sm text-textColor"
                          >
                            Expense Breakdown: {message.breakdown.total}
                          </Text>
                          <View style={styles.breakdownContent}>
                            <View style={styles.donutWrapper}>
                              <View style={styles.donutOuter}>
                                <View style={styles.donutInner}>
                                  <Text
                                    weight="bold"
                                    className="text-base text-textColor"
                                  >
                                    {message.breakdown.total}
                                  </Text>
                                  <Text className="mt-1 text-[10px] text-textColor/60">
                                    Total Spent
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.breakdownList}>
                              {message.breakdown.categories.map((category) => (
                                <View
                                  key={category.id}
                                  style={styles.breakdownListItem}
                                >
                                  <View style={styles.categoryMeta}>
                                    <View
                                      style={[
                                        styles.categoryColor,
                                        { backgroundColor: category.color },
                                      ]}
                                    />
                                    <Text className="text-xs text-textColor/70">
                                      {category.label}
                                    </Text>
                                  </View>
                                  <View style={styles.categoryAmount}>
                                    <Text
                                      weight="semibold"
                                      className="text-xs text-textColor"
                                    >
                                      {category.amount}
                                    </Text>
                                    <Text className="ml-2 text-[10px] text-textColor/60">
                                      {category.percentage}
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        </View>
                      ) : null}
                      <Text className="mt-2 text-[10px] text-textColor/50">
                        {formatRelativeTime(message.timestamp)}
                      </Text>
                    </View>
                  </View>
                );
              }

              return (
                <View key={message.id} style={styles.userMessageRow}>
                  <View style={styles.userBubble}>
                    <Text className="text-sm leading-5 text-white">
                      {message.body}
                    </Text>
                  </View>
                  <Text className="mt-1 text-[10px] text-textColor/50">
                    {formatRelativeTime(message.timestamp)}
                  </Text>
                </View>
              );
            })}

            {askMutation.isPending && (
              <View style={styles.assistantMessageRow}>
                <View style={styles.avatar}>
                  <Image
                    tintColor={COLORS.primary_400}
                    source={require("@/assets/icons/ai_bot.svg")}
                    style={{ width: 24, height: 24 }}
                  />
                </View>
                <View style={styles.assistantBubble}>
                  <Text className="text-sm text-textColor/60">Thinking...</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.composerContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={draftMessage}
              onChangeText={setDraftMessage}
              placeholder="Ask Bobbie about your finances..."
              placeholderTextColor="#9AA5B1"
              style={styles.textInput}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              editable={!askMutation.isPending && !isRecording}
            />
            {isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.primary_400} />
            ) : (
              <Pressable
                onPress={handleMicPress}
                disabled={askMutation.isPending}
                accessibilityRole="button"
                accessibilityLabel={
                  isRecording ? "Stop recording" : "Start voice input"
                }
                style={[
                  styles.micButton,
                  isRecording && styles.micButtonRecording,
                ]}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={24}
                  color={isRecording ? "#FFFFFF" : COLORS.primary_400}
                />
              </Pressable>
            )}
          </View>
          <Pressable
            style={[
              styles.sendButton,
              (askMutation.isPending || isRecording) && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            onPress={handleSend}
            disabled={askMutation.isPending || isRecording}
          >
            <Ionicons name="sparkles-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textColor,
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 8,
  },
  heading1: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
    color: COLORS.textColor,
  },
  heading2: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
    color: COLORS.textColor,
  },
  heading3: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    color: COLORS.textColor,
  },
  strong: {
    fontWeight: "700",
  },
  em: {
    fontStyle: "italic",
  },
  bullet_list: {
    marginTop: 8,
    marginBottom: 8,
  },
  ordered_list: {
    marginTop: 8,
    marginBottom: 8,
  },
  list_item: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet_list_icon: {
    marginRight: 8,
    color: COLORS.primary_400,
  },
  ordered_list_icon: {
    marginRight: 8,
    color: COLORS.primary_400,
  },
  code_inline: {
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 13,
  },
  code_block: {
    backgroundColor: "#F0F4F8",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  fence: {
    backgroundColor: "#F0F4F8",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  blockquote: {
    backgroundColor: "#F6FAFF",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary_400,
    paddingLeft: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  link: {
    color: COLORS.primary_400,
    textDecorationLine: "underline",
  },
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  categoryRow: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },

  categoryChipInactive: {
    backgroundColor: "#E9EDF5",
  },
  messageStack: {
    marginTop: 28,
    gap: 18,
  },
  assistantMessageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary_200,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantBubble: {
    flex: 1,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  bulletList: {
    marginTop: 16,
    gap: 10,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    marginTop: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary_400,
  },
  breakdownCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#F6FAFF",
    padding: 16,
  },
  breakdownContent: {
    flexDirection: "row",
    marginTop: 16,
    gap: 16,
  },
  donutWrapper: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  donutOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EBF1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  donutInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  breakdownList: {
    flex: 1,
    gap: 8,
  },
  breakdownListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryAmount: {
    flexDirection: "row",
    alignItems: "center",
  },
  userMessageRow: {
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  userBubble: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: COLORS.primary_400,
    borderBottomRightRadius: 0,
  },
  composerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: "rgba(250,250,250,0.94)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E0E5EE",
    gap: 12,
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textColor,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  micButtonRecording: {
    backgroundColor: "#FF4444",
  },
  sendButton: {
    marginLeft: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary_400,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A1F36",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});

export default AiAssistantScreen;
