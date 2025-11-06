import Text from "@/components/ui/Text";
import { useSession } from "@/contexts/auth-context/useSession";
import { setStorageItemAsync } from "@/contexts/auth-context/useStorageState";
import { cn } from "@/lib/utils";
import { useLoginUserMutation } from "@/src/api/hooks";
import { ApiError } from "@/src/api/client";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const SignInScreen = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const {
    signIn,
    setIsVerified,
    setUserData,
    setHasCompletedSetup,
    setSetupStep,
  } = useSession();
  const loginMutation = useLoginUserMutation();

  const isSubmitting = loginMutation.isPending;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";
    if (!form.password.trim())
      newErrors.password = "Please enter your password";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      setApiErrorMessage(null);
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      const response = await loginMutation.mutateAsync(payload);
      const accessToken =
        typeof response.accessToken === "string" ? response.accessToken : null;
      if (!accessToken) {
        throw new Error("Missing access token from login response.");
      }
      const refreshToken =
        typeof response.refreshToken === "string" ? response.refreshToken : null;
      const profile =
        response &&
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
          ? response.data
          : null;

      signIn(accessToken);
      if (refreshToken) {
        await setStorageItemAsync("refreshToken", refreshToken);
      }

      if (profile) {
        setUserData(profile);
      }

      const computedIsVerified =
        profile && typeof (profile as { isVerified?: unknown }).isVerified === "boolean"
          ? Boolean((profile as { isVerified?: boolean }).isVerified)
          : true;
      setIsVerified(computedIsVerified);

      const computedHasCompletedSetup =
        profile &&
        typeof (profile as { hasCompletedSetup?: unknown }).hasCompletedSetup ===
          "boolean"
          ? Boolean((profile as { hasCompletedSetup?: boolean }).hasCompletedSetup)
          : true;
      setHasCompletedSetup(computedHasCompletedSetup);

      const nextSetupStep =
        profile &&
        typeof (profile as { setupStep?: unknown }).setupStep === "number"
          ? (profile as { setupStep?: number }).setupStep
          : null;
      setSetupStep(
        nextSetupStep == null || !Number.isFinite(nextSetupStep)
          ? null
          : nextSetupStep,
      );

      Toast.show({
        type: "success",
        text1: "Welcome back",
        text2:
          profile && typeof (profile as { name?: string }).name === "string"
            ? `Hi ${((profile as { name?: string }).name ?? "").split(" ")[0]}`
            : "You’re now signed in.",
      });

      router.replace("/");
    } catch (error) {
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
        "We could not sign you in. Please try again.";
      setApiErrorMessage(message);
      Toast.show({
        type: "error",
        text1: "Sign in failed",
        text2: message,
      });
    }
  }, [
    form.email,
    form.password,
    loginMutation,
    router,
    setHasCompletedSetup,
    setIsVerified,
    setSetupStep,
    setUserData,
    signIn,
  ]);

  return (
    <ScrollView
      className="flex-1 bg-light px-6"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingVertical: 48,
      }}
    >
      <Text family="nunito" weight="bold" className="mb-8 text-center text-3xl">
        Login Your Account
      </Text>

      <View className="mb-4">
        <Text className="mb-2 text-sm text-tertiary">Email</Text>
        <TextInput
          value={form.email}
          onChangeText={(email) => {
            setApiErrorMessage(null);
            setForm({ ...form, email });
          }}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setFocused("email")}
          onBlur={() => setFocused(null)}
          className={cn(
            "rounded-xl border border-gray-200 bg-white px-4 py-3 font-poppins text-base",
            focused === "email" && "focus",
            errors.email ? "border-red-500" : "focus:border-primary_400",
          )}
        />
        {errors.email ? (
          <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>
        ) : null}
      </View>

      <View className="mb-2">
        <Text className="mb-2 text-sm text-tertiary">Password</Text>
        <View
          className={cn(
            "flex-row items-center rounded-xl border px-4",
            focused === "password" && "border-blue-500",
            errors.password
              ? "border-red-500"
              : "border-gray-300 focus:border-blue-500",
          )}
        >
          <TextInput
            value={form.password}
            onChangeText={(password) => {
              setApiErrorMessage(null);
              setForm({ ...form, password });
            }}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            className="flex-1 py-3 font-poppins text-base"
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text className="mt-1 text-sm text-red-500">{errors.password}</Text>
        ) : null}
      </View>

      <Link asChild href="/forgot-password">
        <Pressable className="mb-8 self-end">
          <Text className="text-sm text-tertiary">Forgot Password?</Text>
        </Pressable>
      </Link>

      {apiErrorMessage ? (
        <Text className="mb-3 text-center text-sm text-red-500">
          {apiErrorMessage}
        </Text>
      ) : null}
      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit}
        className={cn(
          "mb-6 items-center justify-center rounded-xl bg-primary_400 py-4",
          isSubmitting && "opacity-80",
        )}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-semibold text-white">Sign in</Text>
        )}
      </Pressable>

      <View className="mb-6 flex-row items-center">
        <View className="h-[1px] flex-1 bg-gray-200" />
        <Text weight="semibold" className="mx-3 text-sm">
          OR
        </Text>
        <View className="h-[1px] flex-1 bg-gray-200" />
      </View>

      <Pressable className="mb-4 flex-row items-center justify-center rounded-xl border border-gray-300 py-4">
        <Image
          source={require("@/assets/icons/google.svg")}
          style={{ width: 20, height: 20 }}
        />
        <Text className="ml-4 text-base text-tertiary">
          Continue with Google
        </Text>
      </Pressable>

      

      <Link asChild href={"/signUp"}>
        <Pressable className="mb-10 flex-row items-center justify-center gap-2">
          <Text className="text-tertiary">New User?</Text>
          <Text weight="medium" className="text-primary_400">
            Sign up
          </Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
};

export default SignInScreen;
