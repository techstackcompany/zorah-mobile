import MainContainer from "@/components/layouts/MainContainer";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  calculateGoalProgress,
  getStatusTone,
} from "@/constants/savings";
import { formatCurrency } from "@/constants/investments";
import { useGetSavingsGoalQuery } from "@/src/api/hooks/useSavingsApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

const SavingsGoalDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: response, isLoading, isError, error } = useGetSavingsGoalQuery(id);


  const goal = response?.data;

  if (isLoading) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-sm text-textColor/60">Loading goal…</Text>
        </View>
      </MainContainer>
    );
  }

  if (isError || !goal) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <Text weight="semibold" className="text-base text-red-500">
            Failed to load savings goal
          </Text>
          <Text className="mt-2 text-sm text-textColor/60 text-center">
            {error?.message ?? "Something went wrong."}
          </Text>
        </View>
      </MainContainer>
    );
  }

  const tone = getStatusTone(goal.status as any);
  const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);

  const contributions = goal.fundingHistory ?? [];

  const formattedProgress = `${(progress * 100).toFixed(0)}% Complete`;

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text weight="semibold" className="text-base text-white">
              Goal Details
            </Text>
            <View style={styles.headerActions}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: tone.background },
                ]}
              >
                <Text
                  weight="semibold"
                  className="text-xs"
                  style={{ color: tone.color }}
                >
                  {tone.label}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.goalInfo}>
            <View
              style={[
                styles.goalIcon,
                { backgroundColor: COLORS.primary_400 + "20" },
              ]}
            >
              <Ionicons name="wallet-outline" size={22} color={COLORS.primary_400} />
            </View>
            <View style={styles.goalInfoText}>
              <Text weight="bold" className="text-lg text-textColor">
                {goal.title}
              </Text>
              <Text className="mt-1 text-sm text-textColor/70">
                {goal.description ?? "No description"}
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text weight="semibold" className="text-sm text-textColor">
              Progress
            </Text>
            <View style={styles.amountRow}>
              <View>
                <Text className="text-xs text-textColor/60">
                  Current Amount
                </Text>
                <Text
                  weight="semibold"
                  className="mt-1 text-base"
                  style={{ color: COLORS.secondary_500 }}
                >
                  {formatCurrency(goal.currentAmount)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text className="text-xs text-textColor/60">Target</Text>
                <Text weight="semibold" className="mt-1 text-base text-textColor">
                  {formatCurrency(goal.targetAmount)}
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor:
                      goal.status === "completed"
                        ? COLORS.secondary_500
                        : COLORS.primary_400,
                  },
                ]}
              />
            </View>
            <Text className="mt-2 text-xs text-textColor/70">
              {formattedProgress}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View>
              <Text className="text-xs text-textColor/60">Category</Text>
              <Text weight="semibold" className="mt-1 text-sm text-textColor">
                {goal.category}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text className="text-xs text-textColor/60">Deadline</Text>
              <Text weight="semibold" className="mt-1 text-sm text-textColor">
                {new Date(goal.deadline).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.historySection}>
            <Text weight="semibold" className="text-sm text-textColor">
              Funding History
            </Text>
            <View style={styles.historyList}>
              {contributions.length === 0 ? (
                <Text className="text-xs text-textColor/60">
                  No contributions yet.
                </Text>
              ) : (
                contributions.map((item) => (
                  <View key={item._id} style={styles.historyItem}>
                    <View>
                      <Text weight="semibold" className="text-sm text-textColor">
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text className="mt-1 text-xs text-textColor/50">
                        {new Date(item.date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Button
            title="Add Money"
            className="flex-1"
            onPress={() =>
              router.push({
                pathname: "/savings-goals/add-money",
                params: { id: goal._id },
              })
            }
          />
          <Button
            title="Share"
            variant="outline"
            className="flex-1"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    marginTop: 16,
  },
  cardHeader: {
    backgroundColor: COLORS.primary_400,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  goalInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  goalInfoText: {
    flex: 1,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#EEF1F8",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  historyList: {
    gap: 14,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 28,
  },
});

export default SavingsGoalDetailsScreen;
