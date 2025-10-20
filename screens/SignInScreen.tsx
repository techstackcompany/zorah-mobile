import Text from "@/components/ui/Text";
import { useSession } from "@/contexts/auth-context/useSession";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignInScreen = () => {
  const [form, setForm] = useState({ name: "", password: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setIsVerified, signIn } = useSession();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Please enter your name";
    if (!form.password.trim())
      newErrors.password = "Please enter your password";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Sign in form submitted:", form);
    }
    signIn("Temp token");
    setIsVerified(true);
    router.navigate("/");
  };

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
        <Text className="mb-2 text-sm text-tertiary">Name</Text>
        <TextInput
          value={form.name}
          onChangeText={(name) => setForm({ ...form, name })}
          placeholder="Enter your full name"
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
          className={cn(
            "rounded-xl border border-gray-200 bg-white px-4 py-3 font-poppins text-base",
            focused === "name" && "focus",
            errors.name ? "border-red-500" : "focus:border-primary_400",
          )}
        />
        {errors.name ? (
          <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>
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
            onChangeText={(password) => setForm({ ...form, password })}
            placeholder="Create a Password"
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

      <Pressable
        onPress={handleSubmit}
        className="mb-6 items-center justify-center rounded-xl bg-primary_400 py-4"
      >
        <Text className="text-base font-semibold text-white">Sign in</Text>
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
