import MainContainer from "@/components/layouts/MainContainer";
import Button from "@/components/ui/Button";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { formatCurrency } from "@/constants/investments";
import {
  GOAL_CONTRIBUTIONS,
  calculateGoalProgress,
  getStatusTone,
  mapApiGoalToUiGoal,
} from "@/constants/savings";
import { useGetSavingsGoalsQuery } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const SavingsGoalsScreen = () => {
  const router = useRouter();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Fetch goals from API
  const {
    data: goalsData,
    isLoading: isGoalsLoading,
    error: goalsError,
    refetch: refetchGoals,
    isRefetching,
  } = useGetSavingsGoalsQuery();

  // Map API goals to UI format
  const uiGoals = useMemo(() => {
    if (!goalsData?.data || !Array.isArray(goalsData.data)) {
      return [];
    }
    return goalsData.data.map(mapApiGoalToUiGoal);
  }, [goalsData]);

  const totalSavings = useMemo(
    () => uiGoals.reduce((sum, goal) => sum + goal.currentAmount, 0),
    [uiGoals],
  );

  const totalGoals = uiGoals.length;

  const selectedGoal = useMemo(
    () =>
      selectedGoalId
        ? (uiGoals.find((goal) => goal.id === selectedGoalId) ?? null)
        : null,
    [selectedGoalId, uiGoals],
  );

  const selectedGoalTone = useMemo(
    () => (selectedGoal ? getStatusTone(selectedGoal.status) : null),
    [selectedGoal],
  );

  const selectedGoalProgress = useMemo(() => {
    if (!selectedGoal) {
      return 0;
    }
    return calculateGoalProgress(
      selectedGoal.currentAmount,
      selectedGoal.targetAmount,
    );
  }, [selectedGoal]);

  const selectedGoalContributions = useMemo(() => {
    if (!selectedGoal) {
      return [];
    }
    return GOAL_CONTRIBUTIONS.filter(
      (item) => item.goalId === selectedGoal.id,
    ).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [selectedGoal]);

  const handleOpenGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowGoalModal(true);
  };

  if (isGoalsLoading && !goalsData) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-textColor/60">Loading your goals...</Text>
        </View>
      </MainContainer>
    );
  }

  if (goalsError) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={styles.errorContainer}>
          <Text weight="semibold" className="text-lg text-textColor">
            Failed to load goals
          </Text>
          <Text className="mt-2 text-center text-textColor/60">
            {goalsError.message || "Something went wrong. Please try again."}
          </Text>
          <Button
            title="Retry"
            className="mt-4"
            onPress={() => refetchGoals()}
          />
        </View>
      </MainContainer>
    );
  }

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchGoals}
            tintColor={COLORS.primary_400}
          />
        }
      >
        <ImageBackground
          source={require("@/assets/images/bg-patterns/noodle.svg")}
          style={styles.summaryCard}
          contentFit="cover"
          imageStyle={styles.summaryPattern}
        >
          <Text className="text-center text-sm text-white/80">
            Total Savings
          </Text>
          <Text weight="bold" className="mt-3 text-center text-3xl text-white">
            {formatCurrency(totalSavings)}
          </Text>
          <Text className="mt-1 text-center text-xs text-white/70">
            Across {totalGoals} {totalGoals === 1 ? "goal" : "goals"}
          </Text>
        </ImageBackground>

        <View style={styles.sectionHeader}>
          <Text weight="semibold" className="text-xl text-textColor">
            Your Goals
          </Text>
        </View>

        <View style={styles.goalList}>
          {uiGoals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text weight="semibold" className="text-lg text-textColor">
                No goals yet
              </Text>
              <Text className="mt-2 text-center text-textColor/60">
                Create your first savings goal to get started!
              </Text>
              <Button
                title="Create Goal"
                className="mt-4"
                onPress={() => router.push("/savings-goals/create")}
              />
            </View>
          ) : (
            uiGoals.map((goal) => {
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
                style={[styles.goalCard]}
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
                      <Text
                        weight="semibold"
                        className="text-lg text-textColor"
                      >
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
                      weight="bold"
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
                      weight="bold"
                      className="mt-1 text-lg"
                      style={{ color: COLORS.secondary_500 }}
                    >
                      {formatCurrency(goal.currentAmount)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text className="text-xs text-textColor/60">Target</Text>
                    <Text weight="bold" className="mt-1 text-lg text-textColor">
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
            })
          )}
        </View>
      </ScrollView>
      <SlideUpModal
        visible={showGoalModal && !!selectedGoal}
        onClose={() => setShowGoalModal(false)}
        title="Goal Details"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#FFFFFF"
      >
        {selectedGoal ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.goalModalContent}
          >
            <View style={styles.goalModalCard}>
              <View style={styles.goalModalHeader}>
                <View style={styles.goalTitleText}>
                  <View className="flex-row gap-2">
                    <View>
                      <Ionicons
                        name={selectedGoal.icon}
                        size={22}
                        color={selectedGoal.iconColor}
                      />
                    </View>
                    <Text weight="bold" className="text-lg text-textColor">
                      {selectedGoal.name}
                    </Text>
                  </View>
                  <Text className="mt-1 text-sm text-textColor/60">
                    {selectedGoal.description}
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Edit goal"
                  onPress={() => {
                    if (!selectedGoal) {
                      return;
                    }
                    setShowGoalModal(false);
                    router.push({
                      pathname: "/savings-goals/edit",
                      params: { id: selectedGoal.id },
                    });
                  }}
                >
                  <Image
                    source={require("@/assets/icons/edit.svg")}
                    style={{ width: 20, height: 20 }}
                    tintColor={COLORS.primary_400}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.goalModalSection}>
                <Text weight="semibold" className="text-lg text-textColor">
                  Progress
                </Text>
                <View style={styles.goalModalAmountRow}>
                  <View>
                    <Text className="text-xs text-textColor/60">
                      Current Amount
                    </Text>
                    <Text
                      weight="bold"
                      className="mt-1 text-base"
                      style={{ color: COLORS.secondary_500 }}
                    >
                      {formatCurrency(selectedGoal.currentAmount)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text className="text-xs text-textColor/60">Target</Text>
                    <Text
                      weight="bold"
                      className="mt-1 text-base text-textColor"
                    >
                      {formatCurrency(selectedGoal.targetAmount)}
                    </Text>
                  </View>
                </View>

                <View style={styles.goalModalProgressTrack}>
                  <View
                    style={[
                      styles.goalModalProgressFill,
                      {
                        width: `${selectedGoalProgress * 100}%`,
                        backgroundColor:
                          selectedGoal.status === "completed"
                            ? COLORS.secondary_500
                            : COLORS.primary_400,
                      },
                    ]}
                  />
                </View>
                <Text className="mt-2 text-xs text-textColor/70">
                  {(selectedGoalProgress * 100).toFixed(0)}% Complete
                </Text>
              </View>

              <View style={styles.goalModalMetaRow}>
                <View>
                  <Text className="text-xs text-textColor/60">Category</Text>
                  <Text
                    weight="semibold"
                    className="mt-1 text-sm text-textColor"
                  >
                    {selectedGoal.category}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text className="text-xs text-textColor/60">Target Date</Text>
                  <Text
                    weight="semibold"
                    className="mt-1 text-sm text-textColor"
                  >
                    {new Date(selectedGoal.targetDate).toLocaleDateString(
                      "en-US",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      },
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.goalModalHistorySection}>
                <Text
                  weight="semibold"
                  className="border-b border-grayLight text-lg text-textColor"
                >
                  Funding History
                </Text>
                <View style={styles.goalModalHistoryList}>
                  {selectedGoalContributions.length === 0 ? (
                    <Text className="text-xs text-textColor/60">
                      No contributions yet.
                    </Text>
                  ) : (
                    selectedGoalContributions.map((item) => (
                      <View key={item.id} style={styles.goalModalHistoryItem}>
                        <View>
                          <Text
                            weight="bold"
                            className="text-base text-textColor"
                          >
                            {formatCurrency(item.amount)}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="mt-1 text-xs text-textColor/50">
                            {new Date(item.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                          <Text className="text-xs text-textColor">
                            {item.source}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>

            <View style={styles.goalModalActionRow}>
              <Button
                title="Add Money"
                className="flex-1"
                onPress={() => {
                  setShowGoalModal(false);
                  if (selectedGoal) {
                    router.push({
                      pathname: "/savings-goals/add-money",
                      params: { id: selectedGoal.id },
                    });
                  }
                }}
              />
              <Button
                title="Share"
                variant="outline"
                className="flex-1"
                onPress={() => {}}
              />
            </View>
          </ScrollView>
        ) : null}
      </SlideUpModal>
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
    borderRadius: 22,
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
  goalModalContent: {
    paddingBottom: 24,
    gap: 24,
  },
  goalModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 24,
  },
  goalModalHeader: {
    flexDirection: "row",
    gap: 16,
  },
  goalModalSection: {
    gap: 16,
  },
  goalModalAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  goalModalProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EEF1F8",
    overflow: "hidden",
  },
  goalModalProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  goalModalMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalModalHistorySection: {
    gap: 16,
  },
  goalModalHistoryList: {
    gap: 14,
  },
  goalModalHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  goalModalActionRow: {
    flexDirection: "row",
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
});

export default SavingsGoalsScreen;
