import MainContainer from "@/components/layouts/MainContainer";
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  INVESTMENT_CATEGORIES,
  INVESTMENT_HOLDINGS,
  formatCurrency,
  formatPercentage,
  getIconName,
} from "@/constants/investments";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const DONUT_RADIUS = 89;
const DONUT_THICKNESS = 40;

const CURRENCY_SYMBOL = formatCurrency(0).replace(/[\d.,\s]/g, "");

const formatCompactPortfolioValue = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000) {
    const compact = (absValue / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
    return `${CURRENCY_SYMBOL}${compact}B`;
  }
  if (absValue >= 1_000_000) {
    const compact = (absValue / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `${CURRENCY_SYMBOL}${compact}M`;
  }
  if (absValue >= 1_000) {
    const compact = (absValue / 1_000).toFixed(1).replace(/\.0$/, "");
    return `${CURRENCY_SYMBOL}${compact}K`;
  }
  return formatCurrency(value);
};

const InvestmentPortfolioScreen = () => {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(
    INVESTMENT_CATEGORIES[0].id,
  );

  const totalValue = useMemo(
    () => INVESTMENT_CATEGORIES.reduce((acc, item) => acc + item.total, 0),
    [],
  );

  const pieData = useMemo(
    () =>
      INVESTMENT_CATEGORIES.map((category) => ({
        value: category.total,
        color: category.color,
        text: formatPercentage(category.percentage),
      })),
    [],
  );

  const filteredHoldings = useMemo(
    () =>
      INVESTMENT_HOLDINGS.filter(
        (holding) => holding.categoryId === selectedCategory,
      ),
    [selectedCategory],
  );

  const selectedCategoryMeta = useMemo(
    () =>
      INVESTMENT_CATEGORIES.find(
        (category) => category.id === selectedCategory,
      ) ?? INVESTMENT_CATEGORIES[0],
    [selectedCategory],
  );

  const compactTotalValue = useMemo(
    () => formatCompactPortfolioValue(totalValue),
    [totalValue],
  );

  const handleOpenDetails = (id: string) => {
    router.push({
      pathname: "/investment/details",
      params: { id },
    });
  };

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require("@/assets/images/bg-patterns/noodle.svg")}
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <Text className="text-sm text-white/60">Total Portfolio Value</Text>
            <Pressable
              onPress={() => setShowBalance((prev) => !prev)}
              accessibilityRole="button"
            >
              <Ionicons
                name={showBalance ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
          <Text weight="bold" className="mt-2 text-2xl text-white">
            {showBalance ? formatCurrency(totalValue) : "•••••••••"}
          </Text>
          <Text className="mt-1 text-xs text-white/70">
            Across {INVESTMENT_HOLDINGS.length} investments
          </Text>
        </ImageBackground>
        <CollapsibleCard
          title={
            <Text weight="semibold" className="text-lg text-textColor">
              Portfolio Allocation
            </Text>
          }
          headerBottomBorder
        >
          <View className="p-5">
            <View style={styles.sectionActions}>
              <Pressable accessibilityRole="button">
                <Ionicons name="chevron-back" size={16} color="#8A94A6" />
              </Pressable>
              <View className="flex-row  items-center">
                <Text weight="semibold" className="mx-3 text-sm text-textColor">
                  September 2025
                </Text>
                <Pressable accessibilityRole="button">
                  <Image
                    source={require("@/assets/icons/calendar.svg")}
                    style={styles.calendarIcon}
                  />
                </Pressable>
              </View>
              <Pressable accessibilityRole="button">
                <Ionicons name="chevron-forward" size={16} color="#8A94A6" />
              </Pressable>
            </View>
            <View className="flex-row items-center">
              <View style={styles.donutWrapper}>
                <PieChart
                  data={pieData}
                  donut
                  showText
                  textColor="#FFFFFF"
                  textSize={11}
                  radius={DONUT_RADIUS}
                  innerRadius={DONUT_RADIUS - DONUT_THICKNESS}
                  innerCircleColor="#FFFFFF"
                  centerLabelComponent={() => (
                    <View style={styles.centerLabel}>
                      <Text className="text-xs text-textColor/60">
                        Investment
                      </Text>
                      <Text weight="bold" className="text-lg text-textColor">
                        {compactTotalValue}
                      </Text>
                    </View>
                  )}
                />
              </View>

              <View style={styles.legendGrid}>
                {INVESTMENT_CATEGORIES.map((category) => (
                  <View key={category.id} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: category.color },
                      ]}
                    />
                    <Text className="text-xs text-textColor/70">
                      {category.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </CollapsibleCard>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text weight="semibold" className="text-base text-textColor">
              Investment category
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {INVESTMENT_CATEGORIES.map((category) => {
              const isActive = category.id === selectedCategory;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.categoryCard,
                    {
                      borderColor: isActive
                        ? category.color
                        : "rgba(206,210,221,0.6)",
                      backgroundColor: isActive
                        ? `${category.color}1A`
                        : "#FFFFFF",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${category.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={getIconName(category.icon)}
                      size={18}
                      color={category.color}
                    />
                  </View>
                  <Text weight="semibold" className="text-sm text-textColor">
                    {category.label}
                  </Text>
                  <Text className="mt-1 text-xs text-textColor/60">
                    {formatCurrency(category.total)}
                  </Text>
                  <Text className="mt-1 text-[10px] text-textColor/50">
                    {formatPercentage(category.percentage)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.categorySummary}>
            <View>
              <Text weight="semibold" className="text-base text-textColor">
                {selectedCategoryMeta.label}
              </Text>
              <Text className="mt-1 text-xs text-textColor/60">
                {formatCurrency(selectedCategoryMeta.total)} •{" "}
                {formatPercentage(selectedCategoryMeta.percentage)}
              </Text>
            </View>
          </View>

          <View style={styles.holdingsList}>
            {filteredHoldings.map((holding) => (
              <Pressable
                key={holding.id}
                onPress={() => handleOpenDetails(holding.id)}
                accessibilityRole="button"
                style={styles.holdingCard}
              >
                <View style={styles.holdingMeta}>
                  <View
                    style={[
                      styles.holdingAvatar,
                      { backgroundColor: selectedCategoryMeta.color },
                    ]}
                  >
                    <Text weight="bold" className="text-sm text-white">
                      {holding.symbol}
                    </Text>
                  </View>
                  <View>
                    <Text
                      weight="semibold"
                      className="text-base text-textColor"
                    >
                      {holding.name}
                    </Text>
                    <Text className="mt-1 text-xs text-textColor/60">
                      {holding.quantityLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.holdingAmount}>
                  <Text weight="bold" className="text-base text-textColor">
                    {formatCurrency(holding.amount)}
                  </Text>
                  <View style={styles.changeRow}>
                    <Ionicons
                      name={
                        holding.change >= 0 ? "trending-up" : "trending-down"
                      }
                      size={14}
                      color={
                        holding.change >= 0 ? COLORS.secondary_500 : "#D83A56"
                      }
                    />
                    <Text
                      weight="semibold"
                      className="ml-1 text-xs"
                      style={{
                        color:
                          holding.change >= 0
                            ? COLORS.secondary_500
                            : "#D83A56",
                      }}
                    >
                      {holding.change >= 0 ? "+" : "-"}
                      {Math.abs(holding.change).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary_400,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: COLORS.primary_400,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  calendarIcon: {
    width: 20,
    height: 20,
  },
  donutWrapper: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    alignItems: "center",
  },
  legendGrid: {
    marginTop: 12,
    gap: 12,
    marginLeft:12
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryScroll: {
    marginTop: 20,
    paddingRight: 4,
    gap: 12,
  },
  categoryCard: {
    width: 180,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  categorySummary: {
    marginTop: 20,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  holdingsList: {
    marginTop: 20,
    gap: 14,
  },
  holdingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F6",
  },
  holdingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  holdingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary_400,
    alignItems: "center",
    justifyContent: "center",
  },
  holdingAmount: {
    alignItems: "flex-end",
  },
  changeRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default InvestmentPortfolioScreen;
