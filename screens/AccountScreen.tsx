import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, useRouter } from "expo-router";
import React, { ReactNode, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";

const LANGUAGE_OPTIONS = [
  { id: "english", label: "English", subLabel: "British English" },
  { id: "french", label: "French", subLabel: "French" },
] as const;

const APPEARANCE_OPTIONS = [
  { id: "light", label: "Light Mode" },
  { id: "dark", label: "Dark Mode" },
] as const;

const AccountScreen = () => {
  const router = useRouter();
  const [allowBankNotification, setAllowBankNotification] = useState(true);
  const [pushNotification, setPushNotification] = useState(true);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0]);
  const [appearance, setAppearance] = useState(APPEARANCE_OPTIONS[0]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const { signOut, userData, isVerified } = useSession();

  const {
    displayName,
    displayEmail,
    displayPhone,
    initials,
    statusLabel,
    linkedBanksText,
  } = useMemo(() => {
    const fallbackName = "PocketMonie User";
    const fallbackInitials = "PU";
    const safeUser = (userData ?? {}) as Record<string, any>;
    const nestedUser =
      safeUser.user && typeof safeUser.user === "object"
        ? (safeUser.user as Record<string, any>)
        : null;

    const pickString = (...values: unknown[]) => {
      for (const value of values) {
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed) {
            return trimmed;
          }
        }
      }
      return null;
    };

    const resolvedName =
      pickString(
        safeUser.name,
        safeUser.fullName,
        nestedUser?.name,
        nestedUser?.fullName,
      ) ?? fallbackName;

    const resolvedEmail =
      pickString(
        safeUser.email,
        nestedUser?.email,
        safeUser.userEmail,
        safeUser.contactEmail,
      ) ?? "";

    const resolvedPhone =
      pickString(
        safeUser.phone,
        safeUser.phoneNumber,
        nestedUser?.phone,
        nestedUser?.phoneNumber,
        safeUser.contactPhone,
      ) ?? "";

    const nameParts = resolvedName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    const computedInitials = nameParts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

    const linkedBanksSource =
      safeUser.selectedBanks ??
      nestedUser?.selectedBanks ??
      safeUser.linkedBanks ??
      nestedUser?.linkedBanks;

    let linkedBanksCount = 0;
    if (Array.isArray(linkedBanksSource)) {
      linkedBanksCount = linkedBanksSource.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0,
      ).length;
    } else if (typeof linkedBanksSource === "string") {
      const trimmed = linkedBanksSource.trim();
      if (trimmed) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            linkedBanksCount = parsed.filter(
              (entry: unknown): entry is string =>
                typeof entry === "string" && entry.trim().length > 0,
            ).length;
          } else {
            linkedBanksCount = trimmed.split(",").filter(Boolean).length;
          }
        } catch {
          linkedBanksCount = trimmed.split(",").filter(Boolean).length;
        }
      }
    } else if (
      typeof linkedBanksSource === "number" &&
      Number.isFinite(linkedBanksSource)
    ) {
      linkedBanksCount = Math.max(0, Math.trunc(linkedBanksSource));
    }

    return {
      displayName: resolvedName,
      displayEmail: resolvedEmail,
      displayPhone: resolvedPhone,
      initials: computedInitials || fallbackInitials,
      statusLabel: isVerified ? "Verified" : "Pending Verification",
      linkedBanksText:
        linkedBanksCount === 1
          ? "1 Linked"
          : `${linkedBanksCount} Linked`,
    };
  }, [isVerified, userData]);

  const handleNavigate = (path: string) => {
    router.push(path as RelativePathString);
  };

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
              label="Status"
              iconSource={require("@/assets/icons/circle-check.svg")}
              value={
                isVerified ? (
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
            <SectionHeader title="System Information" />
            <SectionSubHeader subtitle="Language" />
            <AccountRow
              label="Change Language"
              iconSource={require("@/assets/icons/language.svg")}
              value={
                <Text
                  weight="semibold"
                  className="ml-3 mr-auto rounded-full bg-white px-3 py-2
                 text-sm text-primary_400"
                >
                  {language.label}
                </Text>
              }
              onPress={() => setShowLanguageModal(true)}
            />
          </View>

          <View style={styles.sectionCard}>
            <SectionHeader title="Notifications" />
            <SectionSubHeader subtitle="All Notification Settings" />
            <ToggleRow
              label="Allow Bank Notification"
              description="Allow Zorah to access bank SMS alert"
              value={allowBankNotification}
              onChange={setAllowBankNotification}
            />
            <ToggleRow
              label="Push Notification"
              value={pushNotification}
              onChange={setPushNotification}
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

      <SlideUpModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title="Select Language"
        headerBackgroundColor="#1643F5"
        headerTextColor="#FFFFFF"
      >
        <View className="space-y-2">
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = language.id === option.id;
            return (
              <Pressable
                key={option.id}
                style={styles.modalRow}
                accessibilityRole="button"
                onPress={() => {
                  setLanguage(option);
                  setShowLanguageModal(false);
                }}
              >
                <View>
                  <Text weight="semibold" className="text-sm text-textColor">
                    {option.label}
                  </Text>
                  <Text className="text-xs text-textColor/60">
                    {option.subLabel}
                  </Text>
                </View>
                <SelectionDot selected={isSelected} />
              </Pressable>
            );
          })}
        </View>
      </SlideUpModal>

      <SlideUpModal
        visible={showAppearanceModal}
        onClose={() => setShowAppearanceModal(false)}
        title="Select Appearance"
        headerBackgroundColor="#1643F5"
        headerTextColor="#FFFFFF"
      >
        <View className="space-y-2">
          {APPEARANCE_OPTIONS.map((option) => {
            const isSelected = appearance.id === option.id;
            return (
              <Pressable
                key={option.id}
                style={styles.modalRow}
                accessibilityRole="button"
                onPress={() => {
                  setAppearance(option);
                  setShowAppearanceModal(false);
                }}
              >
                <Text weight="semibold" className="text-sm text-textColor">
                  {option.label}
                </Text>
                <SelectionDot selected={isSelected} />
              </Pressable>
            );
          })}
        </View>
      </SlideUpModal>
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
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
      >
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
};

const ToggleRow = ({ label, description, value, onChange }: ToggleRowProps) => {
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
      />
    </View>
  );
};

const SelectionDot = ({ selected }: { selected: boolean }) => (
  <View
    style={[
      styles.selectionDot,
      {
        borderColor: selected ? COLORS.primary_400 : "#D1D6DE",
      },
    ]}
  >
    {selected ? <View style={styles.selectionDotInner} /> : null}
  </View>
);

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
});

export default AccountScreen;
