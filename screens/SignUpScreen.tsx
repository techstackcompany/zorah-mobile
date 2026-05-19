// import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import TextInputField from "@/components/ui/TextInputField";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import { cn } from "@/lib/utils";
import { ApiError } from "@/src/api/client";
import { useRegisterUserMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";

import { Link } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const SignUpScreen = () => {
  return <OriginalSignUpScreen />;
};

export default SignUpScreen;

const OriginalSignUpScreen = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const [agree, setAgree] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const { signIn } = useSession();
  const registerMutation = useRegisterUserMutation();
  const isSubmitting = registerMutation.isPending;

  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!form.firstName.trim())
      newErrors.firstName = "Please enter your first name";
    if (!form.lastName.trim())
      newErrors.lastName = "Please enter your last name";
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";
    if (!form.password.trim()) newErrors.password = "Please enter password";
    if (!form.phoneNumber.trim())
      newErrors.phoneNumber = "Please enter your phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    form.email,
    form.firstName,
    form.lastName,
    form.password,
    form.phoneNumber,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      setApiErrorMessage(null);
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim(),
        pin: "1234",
        preferredReminderHour: 9,
      };
      const response = await registerMutation.mutateAsync(payload);

      await signIn(response.token);
      Toast.show({
        type: "success",
        text1: "Account created",
        text2: response?.name
          ? `Welcome, ${response.name}!`
          : "Welcome to Zorah!",
      });
    } catch (error) {
      console.error("error", error);
      const apiError = error as ApiError;
      const serverMessage =
        typeof apiError?.data === "object" &&
        apiError.data !== null &&
        "message" in apiError.data &&
        typeof (apiError.data as { message?: string }).message === "string"
          ? (apiError.data as { message?: string }).message
          : undefined;
      const message =
        serverMessage ??
        apiError?.message ??
        "We could not create your account.";
      setApiErrorMessage(message);
      Toast.show({
        type: "error",
        text1: "Sign up failed",
        text2: message,
      });
    }
  }, [
    validate,
    form.firstName,
    form.lastName,
    form.email,
    form.password,
    form.phoneNumber,
    registerMutation,
    signIn,
  ]);

  const handleFormChange = (field: string, value: string) => {
    setApiErrorMessage(null);
    setForm({ ...form, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -60}
    >
      <ScrollView
        className="flex-1 bg-white px-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 48,
          flexGrow: 1,
        }}
      >
        <View className="flex-1 justify-center">
          <Text
            family="nunito"
            weight="bold"
            className="mb-8 text-center text-3xl"
          >
            Create Your Account
          </Text>
          <View className="mb-4 flex-row items-start justify-between gap-2">
            <TextInputField
              containerClassName="flex-1"
              label="First Name"
              value={form.firstName}
              onChangeText={(t) => handleFormChange("firstName", t)}
              placeholderTextColor={COLORS.textFieldPlaceholder}
              placeholder="John"
              error={errors.firstName}
              inputClassName="py-3 font-poppins"
              className="rounded-xl"
            />
            <TextInputField
              containerClassName="flex-1"
              label="Last Name"
              value={form.lastName}
              onChangeText={(t) => handleFormChange("lastName", t)}
              placeholderTextColor={COLORS.textFieldPlaceholder}
              placeholder="Babatunde"
              error={errors.lastName}
              inputClassName="py-3 font-poppins"
              className="rounded-xl"
            />
          </View>

          <TextInputField
            containerClassName="mb-4"
            label="Phone Number"
            value={form.phoneNumber}
            onChangeText={(t) => handleFormChange("phoneNumber", t)}
            placeholderTextColor={COLORS.textFieldPlaceholder}
            placeholder="08012000000"
            keyboardType="phone-pad"
            error={errors.phoneNumber}
            inputClassName="py-3 font-poppins"
            className="rounded-xl"
          />

          <TextInputField
            containerClassName="mb-4"
            label="Email"
            value={form.email}
            onChangeText={(t) => handleFormChange("email", t)}
            placeholderTextColor={COLORS.textFieldPlaceholder}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            inputClassName="py-3 font-poppins"
            className="rounded-xl"
          />

          <TextInputField
            containerClassName="mb-6"
            label="Password"
            value={form.password}
            onChangeText={(t) => handleFormChange("password", t)}
            placeholderTextColor={COLORS.textFieldPlaceholder}
            placeholder="Create a Password"
            secureTextEntry={!showPassword}
            error={errors.password}
            inputClassName="py-3 font-poppins"
            className="rounded-xl"
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={COLORS.textFieldPlaceholder}
                />
              </TouchableOpacity>
            }
          />

          <Pressable
            onPress={() => {
              setApiErrorMessage(null);
              setAgree(!agree);
            }}
            className="mb-6 flex-row items-center"
          >
            <View
              className={cn(
                "mr-3 h-6 w-6 items-center justify-center rounded-md border",
                agree ? "" : "border-textColor",
              )}
            >
              {agree && (
                <Ionicons name="checkmark" size={14} color={COLORS.textColor} />
              )}
            </View>
            <Text className="text-sm">I Agree to </Text>
            <Link asChild href={"/"}>
              <Pressable>
                <Text
                  weight="semibold"
                  className="text-sm text-primary_400 active:underline"
                >
                  Service Policy, Terms and Condition
                </Text>
              </Pressable>
            </Link>
          </Pressable>

          {apiErrorMessage ? (
            <Text className="mb-3 text-center text-sm text-red-500">
              {apiErrorMessage}
            </Text>
          ) : null}
          <Pressable
            disabled={!agree || isSubmitting}
            onPress={handleSubmit}
            className={cn(
              "mb-6 items-center justify-center rounded-xl py-4 active:opacity-80",
              agree ? "bg-primary_400" : "bg-primary_400/30",
              isSubmitting && "opacity-80",
            )}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Create Account
              </Text>
            )}
          </Pressable>

          <Link asChild href={"/signIn"}>
            <Pressable className="flex-row items-center justify-center gap-2">
              <Text className="text-tertiary">Existing User?</Text>
              <Text weight="medium" className="text-primary_400">
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
