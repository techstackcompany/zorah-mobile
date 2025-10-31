import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import SlideUpModal from "@/components/ui/SlideUpModal";

const MOCK_USER = {
  name: "John Niyi",
  email: "john.doe@example.com",
  phone: "+234 812 345 6789",
  status: "Verified",
  linkedBanks: 3,
  language: "English",
  appearance: "Light Mode",
};

const LANGUAGE_OPTIONS = [
  { id: "english", label: "English", subLabel: "British English" },
  { id: "yoruba", label: "Yoruba", subLabel: "Yoruba" },
  { id: "hausa", label: "Hausa", subLabel: "Hausa" },
  { id: "igbo", label: "Igbo", subLabel: "Igbo" },
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

  const initials = useMemo(() => {
    return MOCK_USER.name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <MainContainer edges={["top"]} className="bg-lightMuted">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text weight="bold" className="text-xl text-white">
              {initials}
            </Text>
          </View>
          <Text weight="bold" className="mt-3 text-lg text-textColor">
            {MOCK_USER.name}
          </Text>
          <Text className="mt-1 text-sm text-textColor/70">{MOCK_USER.email}</Text>
          <Text className="mt-1 text-sm text-textColor/70">{MOCK_USER.phone}</Text>
        </View>

        <View style={styles.sectionCard}>
          <SectionHeader title="Account Information" />
          <AccountRow
            label="Edit Profile"
            icon="create-outline"
            onPress={() => handleNavigate("/(app)/profile/edit-profile")}
          />
          <AccountRow
            label="Status"
            icon="shield-checkmark-outline"
            value={MOCK_USER.status}
            valueVariant="status"
          />
          <AccountRow
            label="Bank Accounts"
            icon="card-outline"
            value={`${MOCK_USER.linkedBanks} Linked`}
            onPress={() => handleNavigate("/(app)/profile/banks")}
          />
          <AccountRow
            label="Transaction History"
            icon="receipt-outline"
            onPress={() => handleNavigate("/(app)/transactions/index")}
          />
        </View>

        <View style={styles.sectionCard}>
          <SectionHeader title="System Information" />
          <AccountRow
            label="Change Language"
            icon="language-outline"
            value={language.label}
            onPress={() => setShowLanguageModal(true)}
          />
          <AccountRow
            label="Appearance"
            icon="sunny-outline"
            value={appearance.label}
            onPress={() => setShowAppearanceModal(true)}
          />
        </View>

        <View style={styles.sectionCard}>
          <SectionHeader title="Notifications" />
          <ToggleRow
            label="Allow Bank Notification"
            description="Allow PocketMonie to access bank SMS alert"
            value={allowBankNotification}
            onChange={setAllowBankNotification}
          />
          <ToggleRow
            label="Push Notification"
            value={pushNotification}
            onChange={setPushNotification}
          />
        </View>

        <Pressable style={styles.logoutButton} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary_400} />
          <Text weight="semibold" className="ml-3 text-base text-primary_400">
            Logout
          </Text>
        </Pressable>
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
                  <Text className="text-xs text-textColor/60">{option.subLabel}</Text>
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
  <Text weight="semibold" className="text-xs uppercase text-textColor/40">
    {title}
  </Text>
);

type AccountRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  valueVariant?: "status";
  onPress?: () => void;
};

const AccountRow = ({
  icon,
  label,
  value,
  valueVariant,
  onPress,
}: AccountRowProps) => {
  const Content = (
    <View style={styles.rowContent}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={COLORS.primary_400} />
        </View>
        <Text weight="semibold" className="text-sm text-textColor">
          {label}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {value ? (
          <Text
            weight={valueVariant === "status" ? "semibold" : "medium"}
            className={cn(
              "text-xs",
              valueVariant === "status"
                ? "text-secondary_500"
                : "text-textColor/60",
            )}
          >
            {value}
          </Text>
        ) : null}
        {onPress ? (
          <Ionicons name="chevron-forward" size={16} color="#A0A8B2" />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.rowWrapper}>
        {Content}
      </Pressable>
    );
  }

  return <View style={styles.rowWrapper}>{Content}</View>;
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
        <Text weight="semibold" className="text-sm text-textColor">
          {label}
        </Text>
        {description ? (
          <Text className="mt-1 text-xs text-textColor/60">{description}</Text>
        ) : null}
      </View>
      <Switch
        trackColor={{ true: COLORS.primary_400, false: "#D7DCE5" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#D7DCE5"
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 18,
  },
  avatarCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary_400,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 12,
  },
  rowWrapper: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F6",
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F6",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutButton: {
    marginTop: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary_400,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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

