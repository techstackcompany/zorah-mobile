import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import { cn, extractUserData } from "@/lib/utils";
import {
  useGetUserProfileQuery,
  useWalletOverViewQuery,
} from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, useRouter } from "expo-router";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const KYC_STATUS_STYLES: Record<
  string,
  { label: string; color: string; background: string }
> = {
  verified: {
    label: "Verified",
    color: COLORS.secondary_500,
    background: COLORS.secondary_100,
  },
  pending: {
    label: "Pending",
    color: COLORS.amber,
    background: COLORS.amber + "1A",
  },
  unverified: {
    label: "Unverified",
    color: COLORS.error,
    background: COLORS.error + "1A",
  },
};

const AccountScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut, kycVerificationStatus } = useSession();
  const { data: userData } = useGetUserProfileQuery();
  const { data: overview } = useWalletOverViewQuery();
  const [pendingEnableFromAccount, setPendingEnableFromAccount] =
    useState(false);

  const { displayName, displayEmail, displayPhone, initials } = useMemo(() => {
    const userDataExtracted = extractUserData(userData, {
      fallbackName: "PocketMonie User",
      fallbackInitials: "PU",
      includePhone: true,
    });

    return {
      displayName: userDataExtracted.fullName,
      displayEmail: userDataExtracted.displayEmail,
      displayPhone: userDataExtracted.displayPhone ?? "",
      initials: userDataExtracted.initials,
    };
  }, [userData]);

  const kyc = useMemo(() => {
    // wallet/overview is the live source of truth; fall back to the
    // session-cached status (set at login) while overview is still loading.
    const rawStatus = overview?.kyc.status ?? kycVerificationStatus ?? "";
    const normalized = rawStatus.trim().toLowerCase();
    const style = KYC_STATUS_STYLES[normalized] ?? KYC_STATUS_STYLES.unverified;
    const currentTier = overview?.kyc.currentTier ?? 1;

    return { ...style, currentTier };
  }, [overview, kycVerificationStatus]);

  useFocusEffect(
    useCallback(() => {
      if (!pendingEnableFromAccount) return;

      let active = true;
      const refreshProfile = async () => {
        await queryClient.refetchQueries({
          queryKey: ["auth", "profile"],
          exact: true,
        });
        if (!active) return;
        setPendingEnableFromAccount(false);
      };
      refreshProfile();
      return () => {
        active = false;
      };
    }, [pendingEnableFromAccount, queryClient]),
  );

  const handleNavigate = (path: string) => {
    router.push(path as RelativePathString);
  };

  return (
    <MainContainer edges={[]} className="">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.avatarCard}>
          <LinearGradient
            colors={[COLORS.primary_400, COLORS.secondary_400]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text weight="bold" className="text-3xl text-white">
              {initials}
            </Text>
          </LinearGradient>
          <Text weight="semibold" className="mt-5 text-xl text-textColor">
            {displayName}
          </Text>
          <Text className="mt-2  text-textColor/70">
            {displayEmail || "No email provided"}
          </Text>
          <Text className="mt-2  text-textColor/70">
            {displayPhone || "No phone number provided"}
          </Text>
        </View>
        <View className="gap-6 px-4">
          <View style={styles.sectionCard}>
            <SectionHeader title="Account Information" />
            <SectionSubHeader subtitle="Profile Details" />

            <AccountRow
              label="Edit Profile"
              iconSource={require("@/assets/icons/edit.svg")}
              onPress={() => handleNavigate("/(app)/profile/edit-profile")}
            />

            <AccountRow
              label="Transaction History"
              iconSource={require("@/assets/icons/transaction-history.svg")}
              onPress={() => handleNavigate("/transactions")}
            />

            <AccountRow
              label="KYC Verification"
              iconSource={require("@/assets/icons/verified-check.svg")}
              value={
                <View
                  style={[
                    styles.kycBadge,
                    { backgroundColor: kyc.background },
                  ]}
                >
                  <Text
                    weight="semibold"
                    className="text-xs"
                    style={{ color: kyc.color }}
                  >
                    {kyc.label} · Tier {kyc.currentTier}
                  </Text>
                </View>
              }
              onPress={() => handleNavigate("/(app)/profile/kyc-upgrade")}
            />
          </View>

          <View style={styles.sectionCard}>
            <SectionHeader title="Security & Authentication" />

            <AccountRow
              label="Change Password"
              iconSource={require("@/assets/icons/lock.svg")}
              onPress={() => handleNavigate("/(app)/profile/change-password")}
            />

            <AccountRow
              label="Change PIN"
              iconSource={require("@/assets/icons/lock.svg")}
              onPress={() => handleNavigate("/(app)/(home)/profile/pin-setup")}
            />
          </View>
          <View style={styles.sectionCard}>
            <SectionHeader title="Logout" />

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.logoutButton}
              onPress={signOut}
              accessibilityRole="button"
              className="active:bg-primary_200"
            >
              <Image
                source={require("@/assets/icons/logout.svg")}
                style={{ width: 24, height: 24 }}
              />
              <Text weight="semibold" className="ml-3 ">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </MainContainer>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <Text weight="semibold" className=" text-lg text-textColor">
    {title}
  </Text>
);
const SectionSubHeader = ({ subtitle }: { subtitle: string }) => (
  <Text weight="semibold" className="text-sm text-textColor/60">
    {subtitle}
  </Text>
);

type AccountRowProps = {
  iconSource: ImageSource;
  label: string;
  value?: ReactNode | string;
  valueVariant?: "status";
  onPress?: () => void;
};

const AccountRow = ({
  iconSource,
  label,
  value,
  valueVariant,
  onPress,
}: AccountRowProps) => {
  const Content = (
    <View style={styles.rowContent}>
      <View style={styles.rowLeft}>
        <View>
          <Image
            source={iconSource}
            style={{ width: 24, height: 24 }}
            contentFit="contain"
          />
        </View>
        <Text weight="semibold" className="text-textColor">
          {label}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {value ? (
          typeof value === "string" ? (
            <Text
              weight={valueVariant === "status" ? "semibold" : "medium"}
              className={cn("text-sm", "text-primary_400")}
            >
              {value}
            </Text>
          ) : (
            value
          )
        ) : null}
        {onPress ? (
          <Ionicons name="chevron-forward" size={16} color={COLORS.textColor} />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {Content}
      </Pressable>
    );
  }

  return <View>{Content}</View>;
};

const styles = StyleSheet.create({
  contentContainer: {
    gap: 18,
    paddingBottom: 100,
  },
  avatarCard: {
    backgroundColor: COLORS.purpleLight,
    paddingVertical: 24,
    paddingHorizontal: 16,

    alignItems: "center",
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 20,
    gap: 12,
  },

  rowContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.lightMuted,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F4FD",
    alignItems: "center",
    justifyContent: "center",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleRow: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.lightMuted,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kycBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoutButton: {
    marginTop: 8,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightMuted,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  selectionDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary_400,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.primary_100,
    borderWidth: 1,
    borderColor: COLORS.primary_200,
  },
  confirmButton: {
    backgroundColor: COLORS.primary_400,
  },
});

export default AccountScreen;
