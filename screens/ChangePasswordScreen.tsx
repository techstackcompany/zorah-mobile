import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGetUserProfileQuery } from "@/src/api/hooks";
import {
  useToggleBiometricsMutation,
  useUpdateProfileMutation,
} from "@/src/api/hooks/useAuthApi";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

const ChangePasswordScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile } = useGetUserProfileQuery();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges =
    form.password.trim().length > 0 && form.confirmPassword.trim().length > 0;

  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation();
  const { mutateAsync: toggleBiometrics } = useToggleBiometricsMutation();

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match.",
      });
      return;
    }

    try {
      await updateProfile({ password: form.password });

      if (!profile?.biometricEnabled) {
        await toggleBiometrics({ enabled: true });
        await queryClient.refetchQueries({
          queryKey: ["auth", "profile"],
          exact: true,
        });
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password updated successfully.",
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message || "Failed to update password.",
      });
    }
  };

  return (
    <MainContainer edges={["top"]} className="bg-lightMuted">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-24 pt-6"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-6">
            <FormField
              label="New Password"
              value={form.password}
              onChangeText={handleChange("password")}
              secureTextEntry
            />
            <FormField
              label="Confirm New Password"
              value={form.confirmPassword}
              onChangeText={handleChange("confirmPassword")}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[
              styles.footer,
              (!hasChanges || isPending) && styles.disabled,
            ]}
            onPress={handleSubmit}
            disabled={!hasChanges || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text weight="semibold" className="text-base text-white">
                Update Password
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
};

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
}: FormFieldProps) => (
  <View>
    <Text className="text-sm text-textColor/70">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9AA5B1"
      secureTextEntry={secureTextEntry}
      style={styles.input}
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  input: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textColor,
  },
  footer: {
    marginTop: 32,
    backgroundColor: COLORS.primary_400,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabled: {
    backgroundColor: COLORS.primary_400,
    opacity: 0.6,
  },
});

export default ChangePasswordScreen;
