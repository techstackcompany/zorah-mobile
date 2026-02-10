import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import { extractUserData } from "@/lib/utils";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EditProfileScreen = () => {
  const router = useRouter();
  const { userData } = useSession();
console.log('userData', userData)
  const { displayName, displayEmail, displayPhone, initials } = useMemo(() => {
    return extractUserData(userData, {
      fallbackName: "",
      fallbackInitials: "U",
      includePhone: true,
    });
  }, [userData]);

  
  const initialNote = useMemo(() => {
    const safeUser = (userData ?? {}) as Record<string, unknown>;
    return (typeof safeUser.note === "string" ? safeUser.note : "") || "";
  }, [userData]);

  const [form, setForm] = useState({
    name: displayName || "",
    email: displayEmail || "",
    phone: displayPhone || "",
    note: initialNote,
  });

  
  useEffect(() => {
    setForm({
      name: displayName || "",
      email: displayEmail || "",
      phone: displayPhone || "",
      note: initialNote,
    });
  }, [displayName, displayEmail, displayPhone, initialNote]);

  const handleChange = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    
    const hasChanges =
      (form.name.trim() && form.name !== displayName) ||
      (form.email.trim() && form.email !== displayEmail) ||
      (form.phone.trim() && form.phone !== displayPhone) ||
      form.note !== initialNote;

    if (hasChanges) {
      Alert.alert(
        "Update Not Available",
        "The mutation function is not available.",
        [{ text: "OK" }],
      );
    } else {
      
      router.back();
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

          <TouchableOpacity style={styles.footer} onPress={handleSubmit}>
            <Text weight="semibold" className="text-base text-white">
              Save Changes
            </Text>
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
});

export default EditProfileScreen;
