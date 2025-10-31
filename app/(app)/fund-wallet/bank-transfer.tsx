import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Platform,
  Pressable,
  Share,
  View,
} from "react-native";

const transferDetails = {
  name: "Niyi Johnson Ademola",
  accountNumber: "00985643221",
  bank: "GTBank",
};

const shareOptions = [
  { id: "telegram", label: "Telegram", icon: "logo-telegram" as const },
  { id: "whatsapp", label: "WhatsApp", icon: "logo-whatsapp" as const },
  { id: "facebook", label: "Facebook", icon: "logo-facebook" as const },
  { id: "sms", label: "SMS", icon: "chatbubble-ellipses-outline" as const },
  { id: "email", label: "Email", icon: "mail-outline" as const },
  { id: "instagram", label: "Instagram", icon: "logo-instagram" as const },
];

const formatAmount = (rawValue?: string) => {
  const value = Number(rawValue || "0");
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const BankTransferScreen = () => {
  const { amount } = useLocalSearchParams<{ amount?: string }>();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const formattedAmount = useMemo(() => formatAmount(amount), [amount]);

  const handleShare = async () => {
    try {
      setIsShareOpen(false);
      await Share.share({
        message: `Account Name: ${transferDetails.name}\nAccount Number: ${transferDetails.accountNumber}\nBank: ${transferDetails.bank}\nAmount: ${formattedAmount}`,
      });
    } catch (error) {
      Alert.alert("Share Failed", "Unable to open share options right now.");
    }
  };

  const handleCopy = async () => {
    if (Platform.OS === "web" && "clipboard" in navigator) {
      await navigator.clipboard.writeText(transferDetails.accountNumber);
      Alert.alert("Copied", "Account number copied to clipboard.");
      return;
    }

    Alert.alert("Copied", "Account number copied to clipboard.");
  };

  return (
    <>
      <Stack.Screen options={{ title: "Bank Transfer" }} />
      <MainContainer edges={["top"]} className="bg-lightMuted">
        <View className="flex-1 px-6 pt-6">
          <View className="rounded-3xl border border-grayLight/80 bg-white px-5 py-6 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-textColor/70">Name:</Text>
              <Text weight="semibold" className="text-base text-textColor">
                {transferDetails.name}
              </Text>
            </View>
            <View className="mt-5 flex-row items-center justify-between">
              <Text className="text-sm text-textColor/70">Account Number:</Text>
              <Text weight="bold" className="text-xl text-textColor">
                {transferDetails.accountNumber}
              </Text>
            </View>
            <View className="mt-5 flex-row items-center justify-between">
              <Text className="text-sm text-textColor/70">Bank:</Text>
              <Text weight="semibold" className="text-base text-textColor">
                {transferDetails.bank}
              </Text>
            </View>
          </View>

          <View className="mt-6 flex-row gap-4">
            <Pressable
              onPress={() => setIsShareOpen(true)}
              className="flex-1 flex-row items-center justify-center rounded-xl border border-primary_400 bg-white py-3"
              accessibilityRole="button"
            >
              <Ionicons
                name="share-social-outline"
                size={18}
                color={COLORS.primary_400}
              />
              <Text weight="semibold" className="ml-2 text-primary_400">
                Share Details
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCopy}
              className="flex-1 flex-row items-center justify-center rounded-xl bg-primary_400 py-3"
              accessibilityRole="button"
            >
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
              <Text weight="semibold" className="ml-2 text-white">
                Copy Number
              </Text>
            </Pressable>
          </View>
        </View>
      </MainContainer>

      <SlideUpModal
        visible={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Share"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#FFFFFF"
        closeIconColor="#FFFFFF"
      >
        <Text className="text-base text-textColor">
          Share Esusu Information
        </Text>
        <View className="mt-5 flex-row flex-wrap justify-between gap-y-4">
          {shareOptions.map((option) => (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              onPress={handleShare}
              className="w-[15%] items-center justify-center"
            >
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary_100">
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={COLORS.primary_400}
                />
              </View>
              <Text className="mt-2 text-xs text-textColor/80" numberOfLines={1}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </SlideUpModal>
    </>
  );
};

export default BankTransferScreen;
