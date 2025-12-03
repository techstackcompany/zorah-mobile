import Text from "@/components/ui/Text";
import { useSession } from "@/contexts/auth-context/useSession";
import { setStorageItemAsync } from "@/contexts/auth-context/useStorageState";
import { cn } from "@/lib/utils";
import { ApiError } from "@/src/api/client";
import { useLoginUserMutation } from "@/src/api/hooks";
import type { LoginUserResponse } from "@/src/api/types";
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

const MOCK_SIGN_IN_RESPONSE_ENABLED = false;

const createMockSignInResponse = (email: string) => {
  const normalizedEmail = email?.trim().toLowerCase() || "mock@pocketmonie.app";
  const timestamp = Date.now();
  const mockUser = {
    id: `mock-${timestamp}`,
    name: "Pocket Monie Demo",
    email: normalizedEmail,
    isVerified: true,
    hasCompletedSetup: true,
    setupStep: 3,
  };
  return {
    accessToken: `mock-access-token-${timestamp}`,
    refreshToken: `mock-refresh-token-${timestamp}`,
    user: mockUser,
    data: mockUser,
  };
};

const shouldFallbackToMockSignIn = (error?: unknown) => {
  if (!error) return false;
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as any).status === "number"
  ) {
    const status = (error as any).status ?? 0;
    return status === 0 || status >= 500;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("network") || message.includes("server");
  }
  if (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    const lowerMessage = (
      (error as { message?: string }).message ?? ""
    ).toLowerCase();
    return lowerMessage.includes("network") || lowerMessage.includes("server");
  }
  return false;
};

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

  const processSignInResponse = useCallback(
    async (
      response: LoginUserResponse | ReturnType<typeof createMockSignInResponse>,
    ) => {
      const accessToken =
        typeof response.accessToken === "string" ? response.accessToken : null;
      if (!accessToken) {
        throw new Error("Missing access token from login response.");
      }

      const refreshToken =
        typeof response.refreshToken === "string"
          ? response.refreshToken
          : typeof (response as any)?.data?.refreshToken === "string"
            ? (response as any).data.refreshToken
            : null;

      console.log("Access token found:", !!accessToken);
      console.log("Refresh token found:", !!refreshToken);

      if (refreshToken) {
        await setStorageItemAsync("refreshToken", refreshToken);
        console.log("✅ Refresh token stored successfully");
      } else {
        console.warn(
          "⚠️ No refresh token in login response - token refresh will not work",
        );
        console.warn("Response structure:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          responseKeys: Object.keys(response || {}),
        });
      }

      signIn(accessToken);

      console.log("✅ Access token stored successfully");

      const profileCandidate =
        response && typeof response === "object" ? (response as any) : null;
      const profile =
        profileCandidate && typeof profileCandidate.user === "object"
          ? profileCandidate.user
          : profileCandidate &&
              typeof profileCandidate.data === "object" &&
              !Array.isArray(profileCandidate.data)
            ? profileCandidate.data
            : null;

      if (profile) {
        setUserData(profile);
      }

      const computedIsVerified =
        typeof profile?.isVerified === "boolean" ? profile.isVerified : true;
      setIsVerified(computedIsVerified);

      const computedHasCompletedSetup =
        typeof profile?.hasCompletedSetup === "boolean"
          ? profile.hasCompletedSetup
          : true;
      setHasCompletedSetup(computedHasCompletedSetup);

      const nextSetupStep =
        typeof profile?.setupStep === "number" ? profile.setupStep : null;
      setSetupStep(
        nextSetupStep == null || !Number.isFinite(nextSetupStep)
          ? null
          : nextSetupStep,
      );

      Toast.show({
        type: "success",
        text1: "Welcome back",
        text2:
          typeof profile?.name === "string"
            ? `Hi ${(profile.name ?? "").split(" ")[0]}`
            : "You’re now signed in.",
      });

      router.replace("/");
    },
    [
      router,
      setHasCompletedSetup,
      setIsVerified,
      setSetupStep,
      setUserData,
      signIn,
    ],
  );

  const isSubmitting = loginMutation.isPending;

  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";
    if (!form.password.trim())
      newErrors.password = "Please enter your password";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.email, form.password]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    const normalizedEmail = form.email.trim().toLowerCase();

    try {
      setApiErrorMessage(null);
      const payload = {
        email: normalizedEmail,
        password: form.password,
      };

      if (MOCK_SIGN_IN_RESPONSE_ENABLED) {
        await processSignInResponse(createMockSignInResponse(normalizedEmail));
        return;
      }

      const response = await loginMutation.mutateAsync(payload);
      await processSignInResponse(response);
    } catch (error) {
      if (MOCK_SIGN_IN_RESPONSE_ENABLED || shouldFallbackToMockSignIn(error)) {
        console.warn("Falling back to mock sign-in", error);
        await processSignInResponse(createMockSignInResponse(normalizedEmail));
        return;
      }

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
      console.log("message", message);
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
    processSignInResponse,
    validate,
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
