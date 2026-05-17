import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useGetUserProfileQuery } from "@/src/api/hooks";
import { extractUserData } from "@/lib/utils";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { useUpdateProfileMutation } from "@/src/api/hooks/useAuthApi";
import Toast from "react-native-toast-message";

const EditProfileScreen = () => {
  const router = useRouter();
  const { data: userData } = useGetUserProfileQuery();
  const { fullName, displayEmail, displayPhone, initials } = useMemo(() => {
    return extractUserData(userData, {
      fallbackName: "",
      fallbackInitials: "U",
      includePhone: true,
    });
  }, [userData]);

  const [form, setForm] = useState({
    name: fullName || "",
    email: displayEmail || "",
    phone: displayPhone || "",
  });

  useEffect(() => {
    setForm({
      name: fullName || "",
      email: displayEmail || "",
      phone: displayPhone || "",
    });
  }, [fullName, displayEmail, displayPhone]);

  const handleChange = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges =
    (form.name.trim() && form.name !== fullName) ||
    (form.email.trim() && form.email !== displayEmail) ||
    (form.phone.trim() && form.phone !== displayPhone);

  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation();

  const handleSubmit = async () => {
    try {
      const nameParts = form.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await updateProfile({
        firstName,
        lastName,
        email: form.email,
        phoneNumber: form.phone,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully.",
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message || "Failed to update profile.",
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
          contentContainerClassName="px-6 pb-24"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatar}>
            <Text weight="bold" className="text-xl text-white">
              {initials}
            </Text>
          </View>

          <View className="mt-6 gap-6">
            <FormField
              label="Name"
              value={form.name}
              onChangeText={handleChange("name")}
            />
            <FormField
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={handleChange("email")}
            />
            <FormField
              label="Phone Number"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={handleChange("phone")}
            />
          </View>

          <TouchableOpacity
            style={[styles.footer, (!hasChanges || isPending) && styles.disabled]}
            onPress={handleSubmit}
            disabled={!hasChanges || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text weight="semibold" className="text-base text-white">
                Save Changes
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
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
};

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
}: FormFieldProps) => (
  <View>
    <Text className="text-sm text-textColor/70">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor="#9AA5B1"
      textAlignVertical={multiline ? "top" : "center"}
      style={[
        styles.input,
        multiline ? { height: 120, paddingTop: 14, paddingBottom: 14 } : null,
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary_400,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
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

export default EditProfileScreen;
