import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

const TIMEFRAME_TABS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
] as const;

type TimeframeKey = (typeof TIMEFRAME_TABS)[number]["key"];

type ChartBar = {
  id: string;
  label: string;
  value: number;
  color: string;
};

type MostSpendingItem = {
  id: string;
  label: string;
  change: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  tint: string;
};

type BreakdownItem = {
  id: string;
  label: string;
  usage: string;
  amount: number;
  variance: number;
  status: {
    label: string;
    textColor: string;
    background: string;
  };
};

type AlertItem = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  background: string;
};

type TrackSpendingData = {
  trendLabel: string;
  chart: { bars: ChartBar[] };
  mostSpending: MostSpendingItem[];
  breakdown: BreakdownItem[];
  alerts: AlertItem[];
};

const AI_ASSISTANT_COPY = {
  name: "Bobbie",
  subtitle: "AI Assistance",
  message:
    "Oops, you've used 92% of your food budget. Plan more home meals to avoid overspending next month.",
} as const;

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
});

const formatCurrency = (value: number) =>
  currencyFormatter.format(Math.abs(value));

const BASE_MOST_SPENDING: MostSpendingItem[] = [
  {
    id: "food",
    label: "Food & Drinks",
    change: "+50%",
    icon: "fast-food-outline",
    accent: "#F8924F",
    tint: "#FFF3EA",
  },
  {
    id: "transport",
    label: "Transportation",
    change: "+32%",
    icon: "car-outline",
    accent: "#2D9CDB",
    tint: "#E8F4FF",
  },
  {
    id: "utilities",
    label: "Bill & Utility",
    change: "+15%",
    icon: "flash-outline",
    accent: COLORS.purple,
    tint: "#F1EEFF",
  },
  {
    id: "others",
    label: "Others",
    change: "+15%",
    icon: "grid-outline",
    accent: COLORS.secondary_500,
    tint: COLORS.secondary_100,
  },
];

const BASE_BREAKDOWN: BreakdownItem[] = [
  {
    id: "food",
    label: "Food & Drinks",
    usage: "100% of budget used",
    amount: 60700,
    variance: -19750,
    status: {
      label: "Budget Exceed",
      textColor: "#D83A56",
      background: "#FFE6EA",
    },
  },
  {
    id: "transport",
    label: "Transportation",
    usage: "60% of budget used",
    amount: 45630,
    variance: 13800,
    status: {
      label: "On Track",
      textColor: COLORS.secondary_500,
      background: COLORS.secondary_150,
    },
  },
  {
    id: "utilities",
    label: "Bills & Utility",
    usage: "89% of budget used",
    amount: 24600,
    variance: 23750,
    status: {
      label: "Approaching Limit",
      textColor: "#C47F0E",
      background: "#FFF5DD",
    },
  },
  {
    id: "health",
    label: "Healthcare",
    usage: "98% of budget used",
    amount: 20350,
    variance: -12200,
    status: {
      label: "Approaching Limit",
      textColor: "#C47F0E",
      background: "#FFF5DD",
    },
  },
];

const BASE_ALERTS: AlertItem[] = [
  {
    id: "food-alert",
    label: "Food & Dining",
    description:
      "You spent within your Food & Dining budget yesterday. Try to maintain this streak.",
    icon: "fast-food-outline",
    accent: "#F8924F",
    background: "#FFE9DD",
  },
  {
    id: "transport-alert",
    label: "Transportation",
    description:
      "Your spending on Transportation has increased by 7% compared to last cycle.",
    icon: "car-outline",
    accent: "#2D9CDB",
    background: "#E8F4FF",
  },
];

const TRACK_SPENDING_DATA: Record<TimeframeKey, TrackSpendingData> = {
  daily: {
    trendLabel: "+7.1% vs last month",
    chart: {
      bars: [
        { id: "mon", label: "Mon", value: 42, color: "#E75A7C" },
        { id: "tue", label: "Tue", value: 58, color: "#E75A7C" },
        { id: "wed", label: "Wed", value: 96, color: "#F8924F" },
        { id: "thu", label: "Thu", value: 74, color: "#32A34D" },
        { id: "fri", label: "Fri", value: 88, color: "#F8924F" },
        { id: "sat", label: "Sat", value: 64, color: "#32A34D" },
        { id: "sun", label: "Sun", value: 52, color: "#32A34D" },
      ],
    },
    mostSpending: BASE_MOST_SPENDING,
    breakdown: BASE_BREAKDOWN,
    alerts: BASE_ALERTS,
  },
  weekly: {
    trendLabel: "+7.1% vs last month",
    chart: {
      bars: [
        { id: "w1", label: "W1", value: 220, color: "#E75A7C" },
        { id: "w2", label: "W2", value: 180, color: "#32A34D" },
        { id: "w3", label: "W3", value: 260, color: "#F8924F" },
        { id: "w4", label: "W4", value: 210, color: "#32A34D" },
        { id: "w5", label: "W5", value: 270, color: "#F8924F" },
        { id: "w6", label: "W6", value: 190, color: "#32A34D" },
        { id: "w7", label: "W7", value: 225, color: "#32A34D" },
      ],
    },
    mostSpending: BASE_MOST_SPENDING,
    breakdown: BASE_BREAKDOWN,
    alerts: BASE_ALERTS,
  },
  monthly: {
    trendLabel: "+7.1% vs last month",
    chart: {
      bars: [
        { id: "jan", label: "Jan", value: 180, color: "#32A34D" },
        { id: "feb", label: "Feb", value: 210, color: "#32A34D" },
        { id: "mar", label: "Mar", value: 260, color: "#F8924F" },
        { id: "apr", label: "Apr", value: 195, color: "#32A34D" },
        { id: "may", label: "May", value: 240, color: "#E75A7C" },
        { id: "jun", label: "Jun", value: 205, color: "#32A34D" },
        { id: "jul", label: "Jul", value: 230, color: "#32A34D" },
      ],
    },
    mostSpending: BASE_MOST_SPENDING,
    breakdown: BASE_BREAKDOWN,
    alerts: BASE_ALERTS,
  },
};

const TrackSpendingScreen = () => {
  const [activeTab, setActiveTab] = useState<TimeframeKey>("daily");
  const data = TRACK_SPENDING_DATA[activeTab];
  const trendMatch = useMemo(() => {
    const match = data.trendLabel.match(/^([+\-]?\d+(?:\.\d+)?%)(.*)$/);
    if (!match) {
      return null;
    }
    return { value: match[1], rest: match[2] };
  }, [data.trendLabel]);

  const maxBarValue = useMemo(() => {
    const values = data.chart.bars.map((bar) => bar.value);
    return values.length ? Math.max(...values) : 1;
  }, [data.chart.bars]);

  return (
    <MainContainer edges={[]} className="bg-lightMuted">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.segmentWrapper}>
          {TIMEFRAME_TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.segmentButton,
                  isActive ? styles.segmentButtonActive : null,
                ]}
              >
                <Text
                  weight={isActive ? "semibold" : "medium"}
                  className={`text-sm ${isActive ? "text-textColor" : "text-textColor/60"}`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6 rounded-3xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text weight="semibold" className="text-lg text-textColor">
              Spending Overview
            </Text>
            <Text weight="semibold" className="text-xs text-textColor">
              {trendMatch ? (
                <>
                  <Text weight="semibold" className="text-secondary_500">
                    {trendMatch.value}
                  </Text>
                  {trendMatch.rest}
                </>
              ) : (
                data.trendLabel
              )}
            </Text>
          </View>
          <View className="mt-6 px-1">
            <BarChart
              data={data.chart.bars.map((bar) => ({
                value: bar.value,
                label: bar.label,
                frontColor: bar.color,
              }))}
              maxValue={maxBarValue}
              height={180}
              barWidth={20}
              spacing={18}
              barBorderRadius={12}
              yAxisThickness={0}
              xAxisThickness={0}
              disableScroll
              isAnimated
              labelWidth={24}
              xAxisLabelTextStyle={{
                fontFamily: "NunitoMedium",
                fontSize: 12,
                color: `${COLORS.textColor}60`,
              }}
              yAxisTextStyle={{
                fontFamily: "NunitoMedium",
                fontSize: 10,
                color: `${COLORS.textColor}60`,
              }}
            />
          </View>

          <View className="mt-7">
            <Text weight="semibold" className="text-base text-textColor">
              Most Spending
            </Text>

            <View className="mt-3 flex-row flex-wrap justify-between">
              {data.mostSpending.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.mostSpendingCard,
                    { backgroundColor: item.tint },
                  ]}
                >
                  <View className="i mb-4 flex-row justify-between">
                    <View
                      style={[
                        styles.iconBadge,
                        {
                          borderColor: `${item.accent}`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={item.accent}
                      />
                    </View>
                    <Text
                      weight="semibold"
                      className="text-base text-textColor"
                      style={{ color: item.accent }}
                    >
                      {item.change}
                    </Text>
                  </View>
                  <Text className="mt-1  text-textColor/70">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <ImageBackground
            style={[styles.aiCard]}
            source={require("@/assets/images/home/fold-pattern.png")}
          >
            <View style={styles.aiIcon}>
              <Image
                source={require("@/assets/icons/ai_bot.svg")}
                style={{ width: 24, height: 24 }}
                tintColor={COLORS.textColor}
              />
            </View>
            <View className="ml-3 flex-1">
              <View className="flex-row items-baseline">
                <Text weight="bold" className="text-lg text-textColor">
                  {AI_ASSISTANT_COPY.name}
                </Text>
                <Text weight="semibold" className="ml-1 text-sm text-textColor">
                  {AI_ASSISTANT_COPY.subtitle}
                </Text>
              </View>
              <Text className="mt-1 text-xs text-textColor/70">
                {AI_ASSISTANT_COPY.message}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8A94A6" />
          </ImageBackground>
        </View>

        <View className="mt-6 rounded-3xl bg-white p-5">
          <Text weight="semibold" className="text-base text-textColor">
            Spending Breakdown
          </Text>

          <View className="mt-4">
            {data.breakdown.map((item, index) => {
              const isLast = index === data.breakdown.length - 1;
              return (
                <View
                  key={item.id}
                  className={`flex-row justify-between py-4 ${isLast ? "" : "border-b border-grayLight/60"}`}
                >
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center">
                      <Text
                        weight="semibold"
                        className="text-base text-textColor"
                      >
                        {item.label}
                      </Text>
                      <View
                        className="ml-2 rounded-full px-3 py-1"
                        style={{
                          backgroundColor: item.status.background,
                        }}
                      >
                        <Text
                          weight="semibold"
                          className="text-[10px]"
                          style={{ color: item.status.textColor }}
                        >
                          {item.status.label}
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-2 text-xs text-textColor/60">
                      {item.usage}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text weight="bold" className="text-sm text-textColor">
                      {formatCurrency(item.amount)}
                    </Text>
                    <Text
                      className="mt-1 text-xs"
                      style={{
                        color:
                          item.variance >= 0 ? COLORS.secondary_500 : "#D83A56",
                      }}
                    >
                      {item.variance >= 0 ? "+" : "-"}
                      {formatCurrency(item.variance)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-white p-5">
          <Text weight="semibold" className="text-base text-textColor">
            Spending Above Budget
          </Text>

          <View className="mt-4 gap-3">
            {data.alerts.map((alert) => (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  { backgroundColor: alert.background },
                ]}
              >
                <View
                  style={[
                    styles.alertIcon,
                    {
                      backgroundColor:
                        `${alert.accent}20` as ViewStyle["backgroundColor"],
                    },
                  ]}
                >
                  <Ionicons name={alert.icon} size={20} color={alert.accent} />
                </View>
                <View className="ml-3 flex-1">
                  <Text weight="bold" className="text-sm text-textColor">
                    {alert.label}
                  </Text>
                  <Text className="mt-1 text-xs leading-4 text-textColor/70">
                    {alert.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  segmentWrapper: {
    flexDirection: "row",
    backgroundColor: "#E9EDF5",
    borderRadius: 999,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#1A1A1A",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  mostSpendingCard: {
    width: "48%",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  aiCard: {
    marginTop: 18,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.secondary_200,
    flexDirection: "row",
    alignItems: "center",
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.secondary_400}70`,
    alignItems: "center",
    justifyContent: "center",
  },
  alertCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    alignItems: "flex-start",
  },
  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TrackSpendingScreen;
