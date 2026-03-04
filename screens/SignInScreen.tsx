import PasswordTextInput from "@/components/PasswordTextInput";
import Text from "@/components/ui/Text";
import { useSession } from "@/contexts/auth-context/useSession";
import { cn } from "@/lib/utils";
import { setRefreshToken } from "@/src/api/client";
import { useGetUserProfileQuery, useLoginUserMutation } from "@/src/api/hooks";
import type { LoginUserResponse } from "@/src/api/types";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const SignInScreen = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const {
    signIn,
    setHasCompletedSetup,
    setUserData,
    isAuthenticated,
    signOut,
    userData,
  } = useSession();
  const loginMutation = useLoginUserMutation();
  const focusField = (field: string) => {
    setFocused(field);
  };
  const blurField = () => {
    setFocused(null);
  };

  const { data: profileResponse, isLoading: isProfileLoading } =
    useGetUserProfileQuery({
      enabled: isAuthenticated,
    });

  const processSignInResponse = useCallback(
    async (response: LoginUserResponse) => {
      const accessToken = response.accessToken;
      if (!accessToken) {
        throw new Error("Missing access token from login response.");
      }
      const refreshToken = response.refreshToken;
      if (refreshToken) {
        await setRefreshToken(refreshToken);
      } else {
        console.warn(
          "No refresh token in login response - token refresh will not work",
        );
      }
      await signIn(accessToken);

      const userName = response.user?.name;

      Toast.show({
        type: "success",
        text1: "Welcome back",
        text2:
          typeof userName === "string"
            ? `Hi ${(userName ?? "").split(" ")[0]}`
            : "You're now signed in.",
      });
    },

    [signIn],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isProfileLoading || !profileResponse) return;

    setUserData(profileResponse);

    const isSetupComplete = profileResponse.biometricEnabled === true;
    setHasCompletedSetup(isSetupComplete);

    if (isSetupComplete) {
      router.replace("/(app)/(home)");
    } else {
      router.replace("/(auth)/setup/kyc-details");
    }
  }, [
    isAuthenticated,
    isProfileLoading,
    profileResponse,
    router,
    setUserData,
    setHasCompletedSetup,
  ]);
  const isSubmitting = loginMutation.isPending;

  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";
    if (!form.password.trim())
      newErrors.password = "Please enter your password";
    if (!form.password.trim() || form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.email, form.password]);

  const handleSubmit = useCallback(async () => {
  
    if (!validate()) return;

    const normalizedEmail = form.email.trim().toLowerCase();

    try {
      const payload = {
        email: normalizedEmail,
        password: form.password,
      };
      const response = await loginMutation.mutateAsync(payload);
      await processSignInResponse(response);
    } catch (error) {
      const message = (error as { message: string })?.message;
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
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-light "
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -60}
    >
      <ScrollView
        className="flex-1  px-6"
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
            Login Your Account
          </Text>
          <View className="mb-4">
            <Text className="mb-2 text-sm text-tertiary">Email</Text>
            <TextInput
              value={form.email}
              onChangeText={(email) => {
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
            <PasswordTextInput
              value={form.password}
              error={errors.password || null}
              blurField={blurField}
              focusField={() => focusField("password")}
              onChangeText={(password) => {
                setForm({ ...form, password });
              }}
            />
          </View>
          <Link asChild href="/forgot-password">
            <Pressable className="mb-8 self-end">
              <Text className="text-sm text-tertiary">Forgot Password?</Text>
            </Pressable>
          </Link>
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
              <Text className="text-base font-semibold text-white">
                Sign in
              </Text>
            )}
          </Pressable>
          <View className="mb-6 flex-row items-center">
            <View className="h-[1px] flex-1 bg-gray-200" />
            <Text weight="semibold" className="mx-3 text-sm">
              OR
            </Text>
            <View className="h-[1px] flex-1 bg-gray-200" />
          </View>
          <Link asChild href={"/signUp"}>
            <Pressable className="mb-10 flex-row items-center justify-center gap-2">
              <Text className="text-tertiary">New User?</Text>
              <Text weight="medium" className="text-primary_400">
                Sign up
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
