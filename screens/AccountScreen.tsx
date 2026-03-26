import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import useAppSettings from "@/contexts/settings-context/useAppSettings";
import { cn, extractUserData } from "@/lib/utils";
import type { ApiError } from "@/src/api/client";
import { useToggleBiometricsMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, useRouter } from "expo-router";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const AccountScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut, userData, kycVerificationStatus, setUserData } =
    useSession();
  const { settings, updateSetting } = useAppSettings();
  const [showDisableConfirmModal, setShowDisableConfirmModal] = useState(false);
  const [pendingEnableFromAccount, setPendingEnableFromAccount] =
    useState(false);

  const toggleBiometricsMutation = useToggleBiometricsMutation({
    onSuccess: async (_response, variables) => {
      await queryClient.refetchQueries({
        queryKey: ["auth", "profile"],
        exact: true,
      });

      const freshProfile = queryClient.getQueryData(["auth", "profile"]);
      if (freshProfile) {
        setUserData(freshProfile);
      }

      updateSetting("enableBiometrics", variables.enabled);
      setShowDisableConfirmModal(false);

      Toast.show({
        type: "success",
        text1: variables.enabled
          ? "Biometric login enabled"
          : "Biometric login disabled",
        text2: variables.enabled
          ? "Your account can now be unlocked with biometrics."
          : "PIN login remains available as backup.",
      });
    },
    onError: (error) => {
      const apiError = error as ApiError;
      Toast.show({
        type: "error",
        text1: "Unable to update biometric setting",
        text2: apiError.message || "Please try again.",
      });
      setShowDisableConfirmModal(false);
    },
  });

  const {
    displayName,
    displayEmail,
    displayPhone,
    initials,
    statusLabel,
    linkedBanksText,
    isKycVerified,
    biometricsEnabled,
  } = useMemo(() => {
    const userDataExtracted = extractUserData(userData, {
      fallbackName: "PocketMonie User",
      fallbackInitials: "PU",
      includePhone: true,
    });

    const safeUser = (userData ?? {}) as Record<string, any>;

    let linkedBanksCount = 0;

    const kycStatusRaw =
      (safeUser.KycStatus as string | undefined) ?? kycVerificationStatus;
    const rawKycStatus =
      typeof kycStatusRaw === "string" && kycStatusRaw.trim()
        ? kycStatusRaw.trim()
        : "Unverified";
    const normalizedKycStatus = rawKycStatus.toLowerCase();
    const statusLabel = rawKycStatus;

    return {
      displayName: userDataExtracted.fullName,
      displayEmail: userDataExtracted.displayEmail,
      displayPhone: userDataExtracted.displayPhone ?? "",
      initials: userDataExtracted.initials,
      statusLabel,
      isKycVerified: normalizedKycStatus === "verified",
      biometricsEnabled:
        typeof safeUser.biometricEnabled === "boolean"
          ? safeUser.biometricEnabled
          : settings.enableBiometrics,
      linkedBanksText:
        linkedBanksCount === 1 ? "1 Linked" : `${linkedBanksCount} Linked`,
    };
  }, [kycVerificationStatus, settings.enableBiometrics, userData]);

  useFocusEffect(
    useCallback(() => {
      if (!pendingEnableFromAccount) {
        return;
      }

      let active = true;

      const refreshProfile = async () => {
        await queryClient.refetchQueries({
          queryKey: ["auth", "profile"],
          exact: true,
        });

        if (!active) {
          return;
        }

        const profile = queryClient.getQueryData<Record<string, unknown>>([
          "auth",
          "profile",
        ]);

        const enabled =
          profile && typeof profile.biometricEnabled === "boolean"
            ? profile.biometricEnabled
            : false;
        console.log("enabled", enabled);
        if (enabled) {
          if (profile) {
            setUserData(profile);
          }
          updateSetting("enableBiometrics", true);
          Toast.show({
            type: "success",
            text1: "Backup PIN set",
            text2: "Biometric login is now active.",
          });
        }

        setPendingEnableFromAccount(false);
      };

      refreshProfile();

      return () => {
        active = false;
      };
    }, [pendingEnableFromAccount, queryClient, setUserData, updateSetting]),
  );

  const handleNavigate = (path: string) => {
    router.push(path as RelativePathString);
  };

  const handleBiometricToggle = (nextValue: boolean) => {
    if (toggleBiometricsMutation.isPending) {
      return;
    }

    if (nextValue) {
      setPendingEnableFromAccount(true);
      router.push("/(app)/(home)/profile/pin-setup");
      return;
    }

    setShowDisableConfirmModal(true);
  };

  const confirmDisableBiometric = () => {
    toggleBiometricsMutation.mutate({ enabled: false });
  };
  console.log("biometricEnabled", biometricsEnabled);

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
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
              label="Update KYC Info"
              iconSource={require("@/assets/icons/circle-check.svg")}
              value={
                isKycVerified ? (
                  <View className="flex-row gap-1">
                    <Image
                      source={require("@/assets/icons/verified-check.svg")}
                      style={{ width: 16, height: 16 }}
                    />
                    <Text className="text-sm text-primary_400">
                      {statusLabel}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-sm text-textColor/70">
                    {statusLabel}
                  </Text>
                )
              }
              valueVariant="status"
              onPress={() => handleNavigate("/(app)/profile/kyc-verification")}
            />
            <AccountRow
              label="Bank Accounts"
              iconSource={require("@/assets/icons/bank.svg")}
              value={linkedBanksText}
              onPress={() => handleNavigate("/(app)/profile/banks")}
            />
            <AccountRow
              label="Transaction History"
              iconSource={require("@/assets/icons/transaction-history.svg")}
              onPress={() => handleNavigate("/transactions")}
            />
          </View>

          <View style={styles.sectionCard}>
            <SectionHeader title="Security" />
            <SectionSubHeader subtitle="Authentication & Login Settings" />

            <ToggleRow
              label="Biometric Login"
              description="Use Face ID or fingerprint. A backup PIN is required."
              value={biometricsEnabled}
              onChange={handleBiometricToggle}
              disabled={toggleBiometricsMutation.isPending}
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

      <Modal
        visible={showDisableConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisableConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-outline" size={28} color="#92400E" />
              </View>
              <Text weight="bold" className="mt-3 text-lg text-textColor">
                Turn off biometric login?
              </Text>
              <Text className="mt-2 text-center text-sm text-textColor/70">
                You will still be able to unlock your account using your backup
                PIN.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDisableConfirmModal(false)}
                disabled={toggleBiometricsMutation.isPending}
              >
                <Text weight="semibold" className="text-primary_500">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDisableBiometric}
                disabled={toggleBiometricsMutation.isPending}
              >
                <Text weight="semibold" className="text-white">
                  Turn Off
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

type ToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

const ToggleRow = ({
  label,
  description,
  value,
  onChange,
  disabled = false,
}: ToggleRowProps) => {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text weight="semibold" className=" text-textColor">
          {label}
        </Text>
        {description ? (
          <Text className="mt-1 text-sm text-textColor/60">{description}</Text>
        ) : null}
      </View>
      <Switch
        trackColor={{ true: COLORS.secondary_400, false: "#D7DCE5" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={COLORS.secondary_400}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 40,
    gap: 18,
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
