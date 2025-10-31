import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import SlideUpModal from "@/components/ui/SlideUpModal";
import COLORS from "@/constants/colors";
import {
  DEBT_STATUS_META,
  DEBT_TYPE_META,
  DebtRecord,
  MOCK_DEBTS,
  formatCurrency,
} from "@/constants/debt";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const shareOptions = [
  { id: "telegram", label: "Telegram", icon: "paper-plane-outline" },
  { id: "whatsapp", label: "WhatsApp", icon: "logo-whatsapp" },
  { id: "facebook", label: "Facebook", icon: "logo-facebook" },
  { id: "sms", label: "SMS", icon: "chatbubble-ellipses-outline" },
  { id: "email", label: "Email", icon: "mail-outline" },
  { id: "instagram", label: "Instagram", icon: "logo-instagram" },
] as const;

const DebtDetailsScreen = () => {
  const params = useLocalSearchParams<{ id?: string }>();
  const record = useMemo<DebtRecord>(
    () => MOCK_DEBTS.find((item) => item.id === params.id) ?? MOCK_DEBTS[0],
    [params.id],
  );

  const [isPaid, setIsPaid] = useState(record.status === "settled");
  const [reminderSent, setReminderSent] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const statusMeta = DEBT_STATUS_META[isPaid ? "settled" : record.status];
  const typeMeta = DEBT_TYPE_META[record.type];

  const handleMarkPaid = () => {
    if (isPaid) {
      return;
    }
    setIsPaid(true);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2400);
  };

  const handleSendReminder = () => {
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 2000);
  };

  return (
    <MainContainer edges={["top"]} className="bg-lightMuted">
      <View className="flex-1">
        {showSuccess ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#1C7C4D" />
            <Text weight="semibold" className="ml-2 text-sm text-textColor">
              Debt Recorded Successfully
            </Text>
          </View>
        ) : null}
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.amountCard, { backgroundColor: typeMeta.background }]}>
            <View style={styles.amountHeader}>
              <View style={styles.typeBadge}>
                <Text weight="semibold" className="text-xs" style={{ color: typeMeta.textColor }}>
                  {typeMeta.label}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusMeta.background,
                    borderColor: statusMeta.border,
                  },
                ]}
              >
                <Text
                  weight="semibold"
                  className="text-[11px]"
                  style={{ color: statusMeta.textColor }}
                >
                  {statusMeta.label}
                </Text>
              </View>
            </View>

            <Text weight="bold" className="mt-5 text-3xl text-textColor">
              {formatCurrency(record.amount)}
            </Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.contactRow}>
              <View style={styles.avatar}>
                <Text weight="bold" className="text-lg text-white">
                  {record.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text weight="semibold" className="text-base text-textColor">
                  {record.name}
                </Text>
                <Text className="mt-1 text-xs text-textColor/60">
                  {record.phone}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusMeta.background,
                    borderColor: statusMeta.border,
                  },
                ]}
              >
                <Text
                  weight="semibold"
                  className="text-[11px]"
                  style={{ color: statusMeta.textColor }}
                >
                  {statusMeta.label}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text className="text-xs text-textColor/50">Date</Text>
                <Text weight="semibold" className="mt-1 text-sm text-textColor">
                  {new Date(record.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text className="text-xs text-textColor/50">Due Date</Text>
                <Text weight="semibold" className="mt-1 text-sm text-textColor">
                  {new Date(record.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.notesBlock}>
              <Text className="text-xs text-textColor/50">Notes</Text>
              <Text className="mt-2 text-sm text-textColor/80 leading-5">
                {record.note}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={[
                  styles.primaryAction,
                  isPaid ? styles.primaryActionCompleted : null,
                ]}
                onPress={handleMarkPaid}
                accessibilityRole="button"
              >
                <Ionicons
                  name={isPaid ? "checkmark-circle" : "checkmark-done"}
                  size={18}
                  color={isPaid ? "#1C7C4D" : "#FFFFFF"}
                />
                <Text
                  weight="semibold"
                  className="ml-2 text-sm"
                  style={{ color: isPaid ? "#1C7C4D" : "#FFFFFF" }}
                >
                  {isPaid ? "Paid" : "Mark as Paid"}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.secondaryAction,
                  reminderSent ? styles.secondaryActionCompleted : null,
                ]}
                onPress={handleSendReminder}
                accessibilityRole="button"
              >
                <Ionicons
                  name={reminderSent ? "checkmark-circle" : "megaphone-outline"}
                  size={18}
                  color={reminderSent ? "#1C7C4D" : COLORS.primary_400}
                />
                <Text
                  weight="semibold"
                  className="ml-2 text-sm"
                  style={{
                    color: reminderSent ? "#1C7C4D" : COLORS.primary_400,
                  }}
                >
                  {reminderSent ? "Sent" : "Send Reminder"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.shareRow}
              onPress={() => setShareVisible(true)}
              accessibilityRole="button"
            >
              <View style={styles.shareIcon}>
                <Ionicons name="share-social-outline" size={18} color="#77808F" />
              </View>
              <Text weight="semibold" className="ml-3 text-sm text-textColor">
                Share Details
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#ADB5C1"
                style={{ marginLeft: "auto" }}
              />
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <SlideUpModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        title="Share"
        headerBackgroundColor="#1643F5"
        headerTextColor="#FFFFFF"
      >
        <Text className="text-sm text-textColor/60">
          Share debt information
        </Text>
        <View style={styles.shareOptions}>
          {shareOptions.map((option) => (
            <Pressable
              key={option.id}
              style={styles.shareOptionCard}
              accessibilityRole="button"
            >
              <View style={styles.shareOptionIcon}>
                <Ionicons name={option.icon} size={20} color={COLORS.primary_400} />
              </View>
              <Text className="mt-2 text-xs text-textColor/70">{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </SlideUpModal>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    gap: 20,
  },
  successBanner: {
    backgroundColor: "#DFF5E5",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  amountCard: {
    borderRadius: 24,
    padding: 20,
  },
  amountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    gap: 24,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary_400,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flex: 1,
  },
  notesBlock: {
    backgroundColor: "#F8F9FB",
    borderRadius: 16,
    padding: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: COLORS.primary_400,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionCompleted: {
    backgroundColor: "#E1F4EA",
    borderWidth: 1,
    borderColor: "#A6D9C1",
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.primary_400,
    backgroundColor: "#FFFFFF",
  },
  secondaryActionCompleted: {
    borderColor: "#A6D9C1",
    backgroundColor: "#E1F4EA",
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F6",
  },
  shareIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F3F9",
    alignItems: "center",
    justifyContent: "center",
  },
  shareOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 20,
  },
  shareOptionCard: {
    width: 80,
    alignItems: "center",
  },
  shareOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "#EFF3FF",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DebtDetailsScreen;
