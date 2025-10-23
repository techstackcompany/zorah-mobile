import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type TabKey = "expense" | "income";

type TabContent = {
  key: TabKey;
  label: string;
  categoryTitle: string;
  breakdownTitle: string;
  rankingTitle: string;
};

const TAB_ITEMS: readonly TabContent[] = [
  {
    key: "expense",
    label: "Expense",
    categoryTitle: "Expense Category",
    breakdownTitle: "Expense Breakdown",
    rankingTitle: "Expense ranking",
  },
  {
    key: "income",
    label: "Income",
    categoryTitle: "Income Category",
    breakdownTitle: "Income Breakdown",
    rankingTitle: "Income ranking",
  },
] as const;

const PLACEHOLDER_ROWS = Array.from({ length: 3 }, (_, index) => index);
const PERIOD_LABEL = "2025 Sep";
const EMPTY_TITLE = "No expense tracking information";
const EMPTY_SUBTITLE = "All expenses will appear here";

const ExpensePlanningScreen = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("expense");
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rotation = useRef(
    new Animated.Value(isCategoryCollapsed ? 1 : 0),
  ).current;

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isCategoryCollapsed ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isCategoryCollapsed, rotation]);

  const chevronRotation = useMemo(
    () =>
      rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [rotation],
  );

  const tabConfig = useMemo(
    () => TAB_ITEMS.find((item) => item.key === activeTab)!,
    [activeTab],
  );

  return (
    <MainContainer className="bg-lightMuted" edges={[]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 56 }}
      >
        <View className="px-6">
          <View style={styles.segmentWrapper}>
            {TAB_ITEMS.map((item) => {
              const isActive = item.key === activeTab;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setActiveTab(item.key)}
                  style={[
                    styles.segmentButton,
                    isActive && styles.segmentButtonActive,
                  ]}
                  className={cn(
                    "flex-1 items-center justify-center rounded-full py-3",
                    isActive ? "bg-white" : undefined,
                  )}
                >
                  <Text
                    weight={isActive ? "semibold" : "medium"}
                    className={cn(
                      "text-base",
                      isActive ? "text-textColor" : "text-textColor/60",
                    )}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.card}>
            <Pressable
              className="flex-row items-center justify-between"
              onPress={() => setIsCategoryCollapsed((prev) => !prev)}
            >
              <Text weight="semibold" className="text-base text-textColor">
                {tabConfig.categoryTitle}
              </Text>
              <Animated.View
                style={{ transform: [{ rotate: chevronRotation }] }}
              >
                <Ionicons
                  name="chevron-up"
                  size={20}
                  color={COLORS.textColor}
                />
              </Animated.View>
            </Pressable>
            {!isCategoryCollapsed && (
              <>
                <View style={styles.divider} />

                <View className="mt-5 flex-row items-center justify-between">
                  <Text weight="medium" className="text-sm text-textColor/70">
                    {tabConfig.breakdownTitle}
                  </Text>
                  <Pressable style={styles.periodPill}>
                    <Text weight="semibold" className="text-sm text-textColor">
                      {PERIOD_LABEL}
                    </Text>

                    <Image
                      source={require("@/assets/icons/calendar.svg")}
                      style={{ width: 24, height: 24 }}
                    />
                  </Pressable>
                </View>

                <View style={styles.chartWrapper}>
                  <View style={styles.chartOuterRing}>
                    <View style={styles.chartInnerRing}>
                      <Text
                        weight="semibold"
                        className="text-lg text-textColor"
                      >
                        ₦0.00
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

          <View className="mt-8">
            <Text weight="semibold" className="text-base text-textColor">
              {tabConfig.rankingTitle}
            </Text>

            <View style={styles.rankingCard}>
              <View className="gap-5">
                {PLACEHOLDER_ROWS.map((row) => (
                  <View key={row} className="flex-row items-center gap-4">
                    <View style={styles.placeholderIcon} />
                    <View className="flex-1 gap-2">
                      <View style={styles.placeholderLinePrimary} />
                      <View style={styles.placeholderLineSecondary} />
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.emptyState}>
                <Text weight="semibold" className="text-lg text-textColor/80">
                  {EMPTY_TITLE}
                </Text>
                <Text className="mt-1 text-sm text-textColor/50">
                  {EMPTY_SUBTITLE}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.floatingButton}
                onPress={() => router.push("/add-expense")}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </MainContainer>
  );
};

export default ExpensePlanningScreen;

const styles = StyleSheet.create({
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B1528",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  segmentWrapper: {
    marginTop: 24,
    flexDirection: "row",
    backgroundColor: COLORS.lightBg,
    borderRadius: 32,
    padding: 4,
  },
  segmentButton: {
    borderRadius: 28,
  },
  segmentButtonActive: {
    shadowColor: "#182542",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  card: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  divider: {
    marginTop: 18,
    height: 1,
    backgroundColor: "#EFF1F6",
  },
  periodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.lightBg,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chartWrapper: {
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  chartOuterRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.lightBg,
    alignItems: "center",
    justifyContent: "center",
  },
  chartInnerRing: {
    width: 136,
    height: 136,
    borderRadius: 78,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D8DCE8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 4,
  },
  rankingCard: {
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  placeholderIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.lightBg,
  },
  placeholderLinePrimary: {
    height: 8,
    borderRadius: 12,
    backgroundColor: COLORS.lightBg,
    width: "90%",
  },
  placeholderLineSecondary: {
    height: 7,
    borderRadius: 12,
    backgroundColor: COLORS.lightBg,
    width: "60%",
  },
  emptyState: {
    marginTop: 40,
    marginEnd: 40,
    alignItems: "center",
  },
  floatingButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary_400,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 24,
    bottom: 24,
    shadowColor: "#0F2A72",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
  },
});
