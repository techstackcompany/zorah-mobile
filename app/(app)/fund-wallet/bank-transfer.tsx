import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useDepositFundsMutation } from "@/src/api/hooks/useWalletApi";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, Alert, Pressable, Share, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Toast from "react-native-toast-message";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const isShareOpen = useSharedValue(false);

  const formattedAmount = useMemo(() => formatAmount(amount), [amount]);

  const depositMutation = useDepositFundsMutation({
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });

      
      
      const transaction = (
        response as unknown as {
          transaction?: { reference?: string; status?: string };
        }
      ).transaction;
      const transactionRef = transaction?.reference;

      Toast.show({
        type: "success",
        text1: "Deposit Successful",
        text2: transactionRef
          ? `₦${Number(amount || 0).toLocaleString("en-NG")} deposited. Ref: ${transactionRef.slice(0, 8)}...`
          : `₦${Number(amount || 0).toLocaleString("en-NG")} has been added to your wallet`,
      });

      
      setTimeout(() => {
        router.navigate("/(app)/fund-wallet");
      }, 1500);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Deposit Failed",
        text2: error.message || "Unable to process deposit. Please try again.",
      });
    },
  });

  const handleShare = async () => {
    try {
      isShareOpen.value = false;
      await Share.share({
        message: `Account Name: ${transferDetails.name}\nAccount Number: ${transferDetails.accountNumber}\nBank: ${transferDetails.bank}\nAmount: ${formattedAmount}`,
      });
    } catch {
      Alert.alert("Share Failed", "Unable to open share options right now.");
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(transferDetails.accountNumber);
      Toast.show({
        type: "success",
        text1: "Copied",
        text2: "Account number copied to clipboard",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Copy Failed",
        text2: "Unable to copy account number. Please try again.",
      });
    }
  };

  const handleConfirmDeposit = () => {
    const depositAmount = Number(amount || "0");

    if (depositAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to deposit.");
      return;
    }

    Alert.alert(
      "Confirm Deposit",
      `Are you sure you want to deposit ${formattedAmount}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            depositMutation.mutate({ amount: depositAmount });
          },
        },
      ],
    );
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
              onPress={() => (isShareOpen.value = true)}
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

          <View className="mt-6">
            <Text
              weight="medium"
              className="mb-3 text-center text-sm text-textColor/70"
            >
              After making the transfer, click the button below to confirm
            </Text>
            <Pressable
              onPress={handleConfirmDeposit}
              disabled={depositMutation.isPending}
              className={`flex-row items-center justify-center rounded-xl py-4 ${
                depositMutation.isPending ? "bg-primary_300" : "bg-primary_400"
              }`}
              accessibilityRole="button"
            >
              {depositMutation.isPending ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text weight="semibold" className="ml-2 text-white">
                    Processing...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text weight="semibold" className="ml-2 text-white">
                    I&apos;ve Made the Transfer
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </MainContainer>

      <SlideUpModal
        isOpen={isShareOpen}
        onClose={() => (isShareOpen.value = false)}
        title="Share"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#FFFFFF"
        closeIconColor="#FFFFFF"
      >
        <Text className="text-base text-textColor">
          Share Wallet Information
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
              <Text
                className="mt-2 text-xs text-textColor/80"
                numberOfLines={1}
              >
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
