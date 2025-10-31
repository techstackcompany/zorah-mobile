import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  INVESTMENT_CATEGORIES,
  INVESTMENT_HOLDINGS,
  formatCurrency,
} from "@/constants/investments";
import { Ionicons } from "@expo/vector-icons";
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

  const changeColor =
    holding.change >= 0 ? COLORS.secondary_500 : "#D83A56";

  return (
    <MainContainer edges={["top"]} className="bg-lightMuted">
      <View style={styles.container}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text weight="bold" className="text-xl text-textColor">
                {holding.name}
              </Text>
              <Text className="mt-1 text-xs text-textColor/60">
                {holding.quantityLabel}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    holding.status === "active" ? "#E7F7F0" : "#F5F6FA",
                  borderColor:
                    holding.status === "active"
                      ? "rgba(50,163,77,0.25)"
                      : "rgba(90,104,120,0.18)",
                },
              ]}
            >
              <Text
                weight="semibold"
                className="text-xs"
                style={{
                  color:
                    holding.status === "active"
                      ? COLORS.secondary_500
                      : "#5B6473",
                }}
              >
                {holding.status === "active" ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          <View style={styles.amountBlock}>
            <Text className="text-xs text-textColor/60">Amount Invested</Text>
            <Text weight="bold" className="mt-1 text-2xl text-textColor">
              {formatCurrency(holding.amount)}
            </Text>
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

        <View style={styles.detailCard}>
          <Text weight="semibold" className="text-sm text-textColor">
            Investment Details
          </Text>

          <View style={styles.detailRow}>
            <Text className="text-xs text-textColor/50">Investment Type</Text>
            <Text weight="semibold" className="text-sm text-textColor">
              {category.label}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text className="text-xs text-textColor/50">Platform Provider</Text>
            <Text weight="semibold" className="text-sm text-textColor">
              {holding.provider}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text className="text-xs text-textColor/50">Purchase Date</Text>
            <Text weight="semibold" className="text-sm text-textColor">
              {new Date(holding.purchaseDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.notesCard}>
          <Text className="text-xs text-textColor/50">Notes</Text>
          <Text className="mt-2 text-sm text-textColor/80 leading-5">
            {holding.notes}
          </Text>
        </View>
      </View>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    gap: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
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
    padding: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
});

export default InvestmentDetailsScreen;

