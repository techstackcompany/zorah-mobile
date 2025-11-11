import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import useAppSettings from "@/contexts/settings-context/useAppSettings";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Pressable, ScrollView, Switch, View } from "react-native";

const privacyToggles = [
  {
    key: "marketingEmails" as const,
    label: "Product updates",
    description: "Receive occasional tips and product announcements",
    icon: "mail-outline" as const,
  },
  {
    key: "personalizedInsights" as const,
    label: "Personalized insights",
    description: "Use your activity to tailor budgets and reminders",
    icon: "star-outline" as const,
  },
  {
    key: "shareAnonymizedData" as const,
    label: "Share anonymized analytics",
    description: "Help us improve the app with anonymous usage stats",
    icon: "analytics-outline" as const,
  },
];

const documents = [
  {
    label: "Privacy Policy",
    helper: "Last updated Sept 2024",
    icon: "document-text-outline" as const,
  },
  {
    label: "Terms & Conditions",
    helper: "Read how we protect your data",
    icon: "shield-checkmark-outline" as const,
  },
];

const securityToggles = [
  {
    key: "appLockEnabled" as const,
    label: "Lock Screen",
    description: "Require PocketMonie to unlock when you return to the app",
    icon: "lock-closed-outline" as const,
  },
  {
    key: "appLockRequireFaceId" as const,
    label: "Face ID Unlock",
    description: "Use Face ID to unlock the app lock screen",
    icon: "scan-outline" as const,
  },
  {
    key: "privacyOverlayEnabled" as const,
    label: "Privacy overlay",
    description: "Blur balances and cards when the app goes to the background",
    icon: "eye-off-outline" as const,
  },
];

type SecurityToggleKey = (typeof securityToggles)[number]["key"];

export default function PrivacySettingsScreen() {
  const { settings, updateSetting } = useAppSettings();

  const handleSecurityToggle = (key: SecurityToggleKey, value: boolean) => {
    if (key === "appLockEnabled") {
      updateSetting("appLockEnabled", value);
      if (!value) {
        updateSetting("appLockRequireFaceId", false);
      }
      return;
    }

    if (key === "appLockRequireFaceId") {
      if (value && !settings.appLockEnabled) {
        updateSetting("appLockEnabled", true);
      }
      updateSetting("appLockRequireFaceId", value);
      return;
    }

    updateSetting(key, value);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Privacy" }} />
      <MainContainer edges={["top", "left", "right"]} className="bg-lightMuted">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-3xl bg-white p-5">
            <Text weight="bold" className="text-xl text-textColor">
              Control your data
            </Text>
            <Text className="mt-2 text-sm text-textColor/70">
              Decide what information you share with PocketMonie. You can change these settings anytime.
            </Text>
          </View>

          <View className="rounded-3xl bg-white p-5">
            <Text weight="semibold" className="text-base text-textColor">
              Screen security
            </Text>
            <View className="mt-4 space-y-4">
              {securityToggles.map((item) => {
                const isFaceIdToggle = item.key === "appLockRequireFaceId";
                const disabled = isFaceIdToggle && !settings.appLockEnabled;
                return (
                  <View
                    key={item.key}
                    className="flex-row items-center rounded-2xl border border-[#E6E9F3] px-4 py-3"
                  >
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-primary_100">
                      <Ionicons name={item.icon} size={20} color="#1A43BE" />
                    </View>
                    <View className="flex-1">
                      <Text weight="semibold" className="text-textColor">
                        {item.label}
                      </Text>
                      <Text className="text-sm text-textColor/60">{item.description}</Text>
                      {disabled && (
                        <Text className="text-xs text-textColor/50">
                          Turn on Lock Screen to manage Face ID unlock.
                        </Text>
                      )}
                    </View>
                    <Switch
                      trackColor={{ true: "#1A43BE", false: "#D7DCE5" }}
                      thumbColor="#FFFFFF"
                      onValueChange={(value) => handleSecurityToggle(item.key, value)}
                      value={settings[item.key]}
                      disabled={disabled}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          <View className="rounded-3xl bg-white p-5">
            <Text weight="semibold" className="text-base text-textColor">
              Data preferences
            </Text>
            <View className="mt-4 space-y-4">
              {privacyToggles.map((item) => (
                <View
                  key={item.key}
                  className="flex-row items-center rounded-2xl border border-[#E6E9F3] px-4 py-3"
                >
                  <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-primary_100">
                    <Ionicons name={item.icon} size={20} color="#1A43BE" />
                  </View>
                  <View className="flex-1">
                    <Text weight="semibold" className="text-textColor">
                      {item.label}
                    </Text>
                    <Text className="text-sm text-textColor/60">
                      {item.description}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ true: "#1A43BE", false: "#D7DCE5" }}
                    thumbColor="#FFFFFF"
                    value={settings[item.key]}
                    onValueChange={(value) => updateSetting(item.key, value)}
                  />
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-3xl bg-white p-5">
            <Text weight="semibold" className="text-base text-textColor">
              Documents
            </Text>
            <View className="mt-4 space-y-3">
              {documents.map((doc) => (
                <Pressable
                  key={doc.label}
                  className="flex-row items-center justify-between rounded-2xl border border-[#E6E9F3] px-4 py-4"
                  accessibilityRole="button"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary_100">
                      <Ionicons name={doc.icon} size={20} color="#1A43BE" />
                    </View>
                    <View>
                      <Text weight="semibold" className="text-textColor">
                        {doc.label}
                      </Text>
                      <Text className="text-xs text-textColor/60">{doc.helper}</Text>
                    </View>
                  </View>
                  <Ionicons name="open-outline" size={18} color="#1A43BE" />
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </MainContainer>
    </>
  );
}
