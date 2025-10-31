import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type AssistantCategory = {
  id: string;
  label: string;
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
  timestamp: string;
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
  { id: "saving", label: "Saving Tips" },
  { id: "budget", label: "Budget Help" },
  { id: "investment", label: "Investment Advice" },
  { id: "credit", label: "Credit Score" },
  { id: "spending", label: "Track Spending" },
];

const BREAKDOWN_DATA: BreakdownCategory[] = [
  { id: "food", label: "Food & Dining", amount: "₦32,000", percentage: "32%", color: "#3152FF" },
  { id: "transport", label: "Transportation", amount: "₦27,000", percentage: "32%", color: "#27AE60" },
  { id: "shopping", label: "Shopping", amount: "₦43,000", percentage: "32%", color: "#F2994A" },
  { id: "entertainment", label: "Entertainment", amount: "₦23,000", percentage: "32%", color: "#BB6BD9" },
  { id: "bills", label: "Bills & Utilities", amount: "₦44,000", percentage: "32%", color: "#9B51E0" },
  { id: "others", label: "Others", amount: "₦44,000", percentage: "32%", color: "#7E8DA0" },
];

const MESSAGES: Message[] = [
  {
    id: "intro",
    author: "assistant",
    timestamp: "5m ago",
    title: "Hello! I'm Bobbie, your AI financial assistant. I'm here to help you manage your finance better. How can I assist you today?",
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
    timestamp: "5m ago",
    body: "Let's get started! Would you like to add your income and expenses first, or set a savings goal to work towards?",
  },
  {
    id: "user-question",
    author: "user",
    timestamp: "4m ago",
    body: "Hi Bobbie! Can you help me analyze my spending this month?",
  },
  {
    id: "breakdown",
    author: "assistant",
    timestamp: "5m ago",
    breakdown: {
      total: "₦160,000",
      categories: BREAKDOWN_DATA,
    },
  },
];

const AiAssistantScreen = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [draftMessage, setDraftMessage] = useState("");

  return (
    <MainContainer edges={["top"]} className="bg-lightMuted">
      <View className="flex-1">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
                  onPress={() => setActiveCategory(category.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.categoryChip,
                    isActive ? styles.categoryChipActive : styles.categoryChipInactive,
                  ]}
                >
                  <Text
                    weight={isActive ? "semibold" : "medium"}
                    className={`text-xs ${isActive ? "text-textColor" : "text-textColor/60"}`}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.messageStack}>
            {MESSAGES.map((message) => {
              if (message.author === "assistant") {
                return (
                  <View key={message.id} style={styles.assistantMessageRow}>
                    <View style={styles.avatar}>
                      <Ionicons name="sparkles-outline" size={20} color="#32A34D" />
                    </View>
                    <View style={styles.assistantBubble}>
                      {message.title ? (
                        <Text weight="semibold" className="text-sm text-textColor">
                          {message.title}
                        </Text>
                      ) : null}
                      {message.body ? (
                        <Text className="mt-1 text-sm text-textColor/80 leading-5">
                          {message.body}
                        </Text>
                      ) : null}
                      {message.bullets ? (
                        <View style={styles.bulletList}>
                          {message.bullets.map((item) => (
                            <View key={item} style={styles.bulletItem}>
                              <View style={styles.bulletDot} />
                              <Text className="flex-1 text-sm text-textColor/80 leading-5">
                                {item}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {message.breakdown ? (
                        <View style={styles.breakdownCard}>
                          <Text weight="bold" className="text-sm text-textColor">
                            Expense Breakdown: {message.breakdown.total}
                          </Text>
                          <View style={styles.breakdownContent}>
                            <View style={styles.donutWrapper}>
                              <View style={styles.donutOuter}>
                                <View style={styles.donutInner}>
                                  <Text weight="bold" className="text-base text-textColor">
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
                                <View key={category.id} style={styles.breakdownListItem}>
                                  <View style={styles.categoryMeta}>
                                    <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                                    <Text className="text-xs text-textColor/70">
                                      {category.label}
                                    </Text>
                                  </View>
                                  <View style={styles.categoryAmount}>
                                    <Text weight="semibold" className="text-xs text-textColor">
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
                        {message.timestamp}
                      </Text>
                    </View>
                  </View>
                );
              }

              return (
                <View key={message.id} style={styles.userMessageRow}>
                  <View style={styles.userBubble}>
                    <Text className="text-sm text-white leading-5">{message.body}</Text>
                  </View>
                  <Text className="mt-1 text-[10px] text-textColor/50">
                    {message.timestamp}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.composerContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mic-outline" size={20} color="#8A94A6" />
            <TextInput
              value={draftMessage}
              onChangeText={setDraftMessage}
              placeholder="Ask Bobbie about your finances..."
              placeholderTextColor="#9AA5B1"
              style={styles.textInput}
            />
          </View>
          <Pressable style={styles.sendButton} accessibilityRole="button">
            <Ionicons name="sparkles-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 120,
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
  },
  categoryChipActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#1C274C",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
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
    backgroundColor: "#E7F7F0",
    alignItems: "center",
    justifyContent: "center",
  },
  assistantBubble: {
    flex: 1,
    borderRadius: 20,
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
  },
  composerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
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
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E5EE",
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textColor,
  },
  sendButton: {
    position: "absolute",
    right: 32,
    top: 20,
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
