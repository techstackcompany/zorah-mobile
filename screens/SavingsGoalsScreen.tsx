import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  SAVINGS_GOALS,
  calculateGoalProgress,
  getStatusTone,
} from "@/constants/savings";
import { formatCurrency } from "@/constants/investments";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const SavingsGoalsScreen = () => {
  const router = useRouter();

  const totalSavings = useMemo(
    () =>
      SAVINGS_GOALS.reduce(
        (sum, goal) => sum + goal.currentAmount,
        0,
      ),
    [],
  );

  const totalGoals = SAVINGS_GOALS.length;

  const handleCreateGoal = () => {
    router.push("/savings-goals/create");
  };

  const handleOpenGoal = (goalId: string) => {
    router.push({
      pathname: "/savings-goals/details",
      params: { id: goalId },
    });
  };

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={20} color="#1D2939" />
          </Pressable>
          <Text weight="semibold" className="text-lg text-textColor">
            Savings Goals
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleCreateGoal}
            style={styles.headerButton}
          >
            <Ionicons name="add" size={22} color={COLORS.primary_400} />
          </Pressable>
        </View>

        <ImageBackground
          source={require("@/assets/images/bg-patterns/noodle.svg")}
          style={styles.summaryCard}
          imageStyle={styles.summaryPattern}
        >
          <Text className="text-sm text-white/80">Total Savings</Text>
          <Text weight="bold" className="mt-3 text-3xl text-white">
            {formatCurrency(totalSavings)}
          </Text>
          <Text className="mt-1 text-xs text-white/70">
            Across {totalGoals} {totalGoals === 1 ? "goal" : "goals"}
          </Text>
        </ImageBackground>

        <View style={styles.sectionHeader}>
          <Text weight="semibold" className="text-base text-textColor">
            Your Goals
          </Text>
        </View>

        <View style={styles.goalList}>
          {SAVINGS_GOALS.map((goal) => {
            const progress = calculateGoalProgress(
              goal.currentAmount,
              goal.targetAmount,
            );
            const tone = getStatusTone(goal.status);
            return (
              <Pressable
                key={goal.id}
                accessibilityRole="button"
                onPress={() => handleOpenGoal(goal.id)}
                style={[styles.goalCard, { backgroundColor: goal.accent }]}
              >
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleRow}>
                    <View
                      style={[
                        styles.goalIcon,
                        { backgroundColor: goal.iconBackground },
                      ]}
                    >
                      <Ionicons
                        name={goal.icon}
                        size={20}
                        color={goal.iconColor}
                      />
                    </View>
                    <View style={styles.goalTitleText}>
                      <Text weight="semibold" className="text-base text-textColor">
                        {goal.name}
                      </Text>
                      <Text
                        numberOfLines={2}
                        className="mt-1 text-xs text-textColor/60"
                      >
                        {goal.description}
                      </Text>
                    </View>
                  </View>
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

                <View style={styles.amountRow}>
                  <View>
                    <Text className="text-xs text-textColor/60">
                      Current Amount
                    </Text>
                    <Text
                      weight="semibold"
                      className="mt-1 text-sm"
                      style={{ color: COLORS.secondary_500 }}
                    >
                      {formatCurrency(goal.currentAmount)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text className="text-xs text-textColor/60">Target</Text>
                    <Text weight="semibold" className="mt-1 text-sm text-textColor">
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
                  {(progress * 100).toFixed(0)}% Complete
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  headerButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  summaryCard: {
    marginTop: 24,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    overflow: "hidden",
    backgroundColor: COLORS.primary_400,
  },
  summaryPattern: {
    resizeMode: "cover",
    opacity: 0.5,
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
  },
  goalList: {
    gap: 16,
    paddingBottom: 24,
  },
  goalCard: {
    borderRadius: 24,
    padding: 20,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  goalTitleText: {
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 18,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});

export default SavingsGoalsScreen;
