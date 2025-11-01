import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  INVESTMENT_CATEGORIES,
  INVESTMENT_HOLDINGS,
  formatCurrency,
} from "@/constants/investments";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

const InvestmentDetailsScreen = () => {
  const params = useLocalSearchParams<{ id?: string }>();

  const holding = useMemo(() => {
    return (
      INVESTMENT_HOLDINGS.find((item) => item.id === params.id) ??
      INVESTMENT_HOLDINGS[0]
    );
  }, [params.id]);

  const category = useMemo(
    () =>
      INVESTMENT_CATEGORIES.find((item) => item.id === holding.categoryId) ??
      INVESTMENT_CATEGORIES[0],
    [holding.categoryId],
  );

  const changeColor = holding.change >= 0 ? COLORS.secondary_500 : "#D83A56";

  return (
    <MainContainer edges={[]} className="bg-lightMuted  p-6">
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text weight="bold" className="text-xl text-textColor">
              {holding.name}
            </Text>
            <Text className="mt-1 text-xs text-textColor/60">
              {holding.change > 0 ? (
                <Feather
                  name="arrow-up"
                  size={12}
                  color={COLORS.secondary_500}
                />
              ) : (
                <Feather name="arrow-down" size={12} color="black" />
              )}{" "}
              {holding.quantityLabel}
            </Text>
          </View>
          <View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: "white",
                },
              ]}
            >
              <Text
                weight="semibold"
                className="text-xs"
                style={{
                  color:
                    holding.status === "active"
                      ? COLORS.primary_400
                      : "#5B6473",
                }}
              >
                {holding.status === "active" ? "Active" : "Inactive"}
              </Text>
            </View>
            <View style={styles.changeRow}>
              <Ionicons
                name={holding.change >= 0 ? "trending-up" : "trending-down"}
                size={16}
                color={changeColor}
              />
              <Text
                weight="semibold"
                className="ml-1 text-xs"
                style={{ color: changeColor }}
              >
                {holding.change >= 0 ? "+" : "-"}
                {Math.abs(holding.change).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
        <View>
          <View style={styles.detailCard}>
            <Text weight="semibold" className="text-sm text-textColor">
              Investment Details
            </Text>

            <View style={styles.detailRow}>
              <Text className="text-sm text-textColor/50">Investment Type</Text>
              <Text weight="semibold" className="text-sm text-textColor">
                {category.label}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text className="text-sm text-textColor/50">
                Platform Provider
              </Text>
              <Text weight="semibold" className="text-sm text-textColor">
                {holding.provider}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text className="text-sm text-textColor/50">
                Amount Investment
              </Text>
              <Text weight="semibold" className="text-sm text-textColor">
                {formatCurrency(holding.amount)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text className="text-sm text-textColor/50">Purchase Date</Text>
              <Text weight="semibold" className="text-sm text-textColor">
                {new Date(holding.purchaseDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.notesCard}>
              <Text className="text-sm text-textColor">Notes</Text>
              <Text className="mt-2 rounded-xl bg-lightMuted p-3 text-sm leading-5 text-textColor">
                {holding.notes}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    gap: 18,
    paddingBottom: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary_100,
    padding: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 16,
  },
  amountBlock: {
    gap: 4,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    gap: 16,
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notesCard: {
    backgroundColor: "#FFFFFF",
  },
});

export default InvestmentDetailsScreen;
