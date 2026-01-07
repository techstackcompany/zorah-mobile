import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  isFocused?: boolean;
  focusField?: () => void;
  blurField?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string | null;
  placeholder?: string;
}

const PasswordTextInput = ({
  isFocused,
  focusField,
  blurField,
  value,
  onChangeText,
  placeholder,

  error,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View>
      <Text className="mb-2 text-sm text-tertiary">Password</Text>
      <View
        className={cn(
          "flex-row items-center rounded-xl border px-4",
          isFocused && "border-blue-500",
          error ? "border-red-500" : "border-gray-300 focus:border-blue-500",
        )}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || "Enter your password"}
          secureTextEntry={!showPassword}
          onFocus={focusField}
          onBlur={blurField}
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
      {error ? (
        <Text className="mt-1 text-sm text-red-500">{error}</Text>
      ) : null}
    </View>
  );
};

export default PasswordTextInput;
