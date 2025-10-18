import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
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
      className="bg-light flex-1 px-6 pt-20"
      keyboardShouldPersistTaps="handled"
    >
      <Text
        family="nunito"
        weight="bold"
        className="mb-6 text-center  text-3xl "
      >
        Create Your Account
      </Text>

      {/* Name Field */}
      <View className="mb-4">
        <Text className="text-tertiary mb-2 text-sm">Name</Text>
        <TextInput
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
          placeholder="Enter your full name"
          className={cn(
            "rounded-xl border border-red-500 bg-white px-4 py-4 text-base",
            focused === "name" && "border-blue-500",
            errors.name
              ? "border-red-500"
              : "border-gray-300 focus:border-blue-500",
          )}
        />
        {errors.name && (
          <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>
        )}
      </View>

      {/* Email Field */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Email</Text>
        <TextInput
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
          onFocus={() => setFocused("email")}
          onBlur={() => setFocused(null)}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ borderColor: "red" }}
          className={cn(
            "rounded-xl border border-red-500 px-4 py-3 text-base",
            focused === "email" && "border-blue-500",
            errors.email
              ? "border-red-500"
              : "border-gray-300 focus:border-blue-500",
          )}
        />
        {errors.email && (
          <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>
        )}
      </View>

      {/* Phone Field */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Phone Number</Text>
        <TextInput
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          onFocus={() => setFocused("phone")}
          onBlur={() => setFocused(null)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          className={cn(
            "rounded-xl border px-4 py-3 text-base",
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
        <Text className="text-gray-700 mb-2">Password</Text>
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
            className="flex-1 py-3 text-base"
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
            "mr-3 h-5 w-5 items-center justify-center rounded border",
            agree ? "border-blue-500 bg-blue-500" : "border-gray-400",
          )}
        >
          {agree && <Ionicons name="checkmark" size={14} color="white" />}
        </View>
        <Text className="text-gray-600 text-sm">
          I Agree to Service Policy, Terms and Condition
        </Text>
      </Pressable>

      {/* Create Account Button */}
      <Pressable
        disabled={!agree}
        onPress={handleSubmit}
        className={cn(
          "mb-6 items-center justify-center rounded-xl py-4",
          agree ? "bg-blue-500" : "bg-blue-200",
        )}
      >
        <Text className="text-base font-semibold text-white">
          Create Account
        </Text>
      </Pressable>

      {/* Divider */}
      <View className="mb-6 flex-row items-center">
        <View className="bg-gray-200 h-[1px] flex-1" />
        <Text className="text-gray-500 mx-3 text-sm">OR</Text>
        <View className="bg-gray-200 h-[1px] flex-1" />
      </View>

      {/* Continue with Google */}
      <Pressable className="border-gray-300 mb-10 flex-row items-center justify-center rounded-xl border py-4">
        <Ionicons name="logo-google" size={20} color="#000" />
        <Text className="text-gray-700 ml-2 text-base font-medium">
          Continue with Google
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({});
