import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import useAppSettings from "@/contexts/settings-context/useAppSettings";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ScrollView, Switch, View } from "react-native";

const biometricOptions = [
  {
    key: "faceIdEnabled" as const,
    label: "Face ID",
    description: "Use your face to verify identity instantly",
    icon: "scan-outline" as const,
  },
  {
    key: "fingerprintEnabled" as const,
    label: "Fingerprint Unlock",
    description: "Authenticate with your fingerprint sensor",
    icon: "finger-print-outline" as const,
  },
];

const safetyTips = [
  "Use biometrics only on devices you trust",
  "Keep your device OS updated for the latest security patches",
  "Disable biometric access immediately if your device is lost",
];

export default function BiometricSettingsScreen() {
  const { settings, updateSetting } = useAppSettings();

  return (
    <>
      <Stack.Screen options={{ title: "Biometric Login" }} />
      <MainContainer edges={["top", "left", "right"]} className="bg-lightMuted">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-3xl bg-[#E7EEFF] p-6">
            <Text weight="bold" className="text-xl text-textColor">
              Secure your sign in
            </Text>
            <Text className="mt-2 text-sm text-textColor/70">
              Turn on biometric login to unlock your account with Face ID or fingerprint.
            </Text>
            <View className="mt-6 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3">
              <View>
                <Text weight="semibold" className="text-textColor">
                  Biometric login
                </Text>
                <Text className="text-sm text-textColor/60">
                  Use biometrics instead of password
                </Text>
              </View>
              <Switch
                trackColor={{ true: "#1A43BE", false: "#D7DCE5" }}
                thumbColor="#FFFFFF"
                value={settings.enableBiometrics}
                onValueChange={(value) => {
                  updateSetting("enableBiometrics", value);
                  if (!value) {
                    updateSetting("faceIdEnabled", false);
                    updateSetting("fingerprintEnabled", false);
                  }
                }}
              />
            </View>
          </View>

          <View className="rounded-3xl bg-white p-5">
            <Text weight="semibold" className="text-base text-textColor">
              Authentication methods
            </Text>
            <View className="mt-4 space-y-4">
              {biometricOptions.map((option) => (
                <View
                  key={option.key}
                  className="flex-row items-center rounded-2xl border border-[#E6E9F3] px-4 py-3"
                >
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-primary_100">
                    <Ionicons name={option.icon} size={22} color="#1A43BE" />
                  </View>
                  <View className="flex-1">
                    <Text weight="semibold" className="text-textColor">
                      {option.label}
                    </Text>
                    <Text className="text-sm text-textColor/60">
                      {option.description}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ true: "#1A43BE", false: "#D7DCE5" }}
                    thumbColor="#FFFFFF"
                    value={settings[option.key]}
                    onValueChange={(value) => updateSetting(option.key, value)}
                    disabled={!settings.enableBiometrics}
                  />
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-3xl bg-white p-5">
            <Text weight="semibold" className="text-base text-textColor">
              Safety reminders
            </Text>
            <View className="mt-4 space-y-3">
              {safetyTips.map((tip) => (
                <View key={tip} className="flex-row items-start gap-3">
                  <Ionicons name="shield-checkmark-outline" size={18} color="#1A43BE" />
                  <Text className="flex-1 text-sm text-textColor/80">{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </MainContainer>
    </>
  );
}
