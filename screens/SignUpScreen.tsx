import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignUpScreen = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Please enter your name";
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";
    if (!/^\d{10,15}$/.test(form.phone))
      newErrors.phone = "Please enter phone number";
    if (!form.password.trim()) newErrors.password = "Please enter password";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Form submitted:", form);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-light px-6 pt-20"
      keyboardShouldPersistTaps="handled"
    >
      <Text
        family="nunito"
        weight="bold"
        className="mb-8 text-center  text-3xl "
      >
        Create Your Account
      </Text>

      {/* Name Field */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-tertiary">Name</Text>
        <TextInput
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
          placeholder="Enter your full name"
          className={cn(
            "border-gray-200 font-poppins rounded-xl border bg-white px-4 py-3 text-base",
            focused === "name" && "focus",
            errors.name ? "border-red-500" : "focus:border-primary_400",
          )}
        />
        {errors.name && (
          <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>
        )}
      </View>

      {/* Email Field */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-tertiary">Email</Text>
        <TextInput
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
          onFocus={() => setFocused("email")}
          onBlur={() => setFocused(null)}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          className={cn(
            "border-gray-300 font-poppins rounded-xl border px-4 py-3 text-base",
            focused === "email" && "focus",
            errors.email ? "border-red-500" : "focus:border-blue-500",
          )}
        />
        {errors.email && (
          <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>
        )}
      </View>

      {/* Phone Field */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-tertiary">Phone Number</Text>
        <TextInput
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          onFocus={() => setFocused("phone")}
          onBlur={() => setFocused(null)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          className={cn(
            "font-poppins rounded-xl border px-4 py-3 text-base",
            focused === "phone" && "border-blue-500",
            errors.phone
              ? "border-red-500"
              : "border-gray-300 focus:border-blue-500",
          )}
        />
        {errors.phone && (
          <Text className="mt-1 text-sm text-red-500">{errors.phone}</Text>
        )}
      </View>

      {/* Password Field */}
      <View className="mb-6">
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
            onChangeText={(t) => setForm({ ...form, password: t })}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            placeholder="Create a Password"
            secureTextEntry={!showPassword}
            className="font-poppins flex-1 py-3 text-base"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text className="mt-1 text-sm text-red-500">{errors.password}</Text>
        )}
      </View>

      {/* Terms */}
      <Pressable
        onPress={() => setAgree(!agree)}
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
              className="text-primary_400 text-sm active:underline"
            >
              Service Policy, Terms and Condition
            </Text>
          </Pressable>
        </Link>
      </Pressable>

      {/* Create Account Button */}
      <Pressable
        disabled={!agree}
        onPress={handleSubmit}
        className={cn(
          "mb-6 items-center justify-center rounded-xl py-4",
          agree ? "bg-primary_400" : "bg-primary_400/30",
        )}
      >
        <Text className="text-base font-semibold text-white">
          Create Account
        </Text>
      </Pressable>

      {/* Divider */}
      <View className="mb-6 flex-row items-center">
        <View className="bg-gray-200 h-[1px] flex-1" />
        <Text weight="semibold" className="mx-3 text-sm">
          OR
        </Text>
        <View className="bg-gray-200 h-[1px] flex-1" />
      </View>

      {/* Continue with Google */}
      <Pressable className="border-gray-300 mb-6 flex-row items-center justify-center rounded-xl border py-4">
        <Image
          source={require("@/assets/icons/google.svg")}
          style={{ width: 20, height: 20 }}
        />
        <Text className="ml-4 text-base text-tertiary">
          Continue with Google
        </Text>
      </Pressable>
      {/* Continue with Twitter */}
      <Pressable className="border-gray-300 mb-8 flex-row items-center justify-center rounded-xl border py-4">
        <Image
          source={require("@/assets/icons/twitter.svg")}
          style={{ width: 20, height: 20 }}
        />
        <Text className="ml-4 text-base text-tertiary">
          Continue with Twitter
        </Text>
      </Pressable>
      <Link asChild href={"/signIn"}>
        <Pressable className="flex-row items-center justify-center gap-2">
          <Text className="text-tertiary">Existing User?</Text>
          <Text weight="medium" className="text-primary_400">
            Sign In
          </Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
};

export default SignUpScreen;
