import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

const transactionSummary = {
  title: "Jollof Rice at Mama Cass",
  amount: -2500,
  bank: "GTBank",
  note: "Lunch with colleagues",
};

const transactionDetails = [
  { id: "recipient", label: "Recipient Details", value: "Mama Cass" },
  { id: "transactionId", label: "Transaction ID", value: "TNX245537789" },
  { id: "paymentMethod", label: "Payment Method", value: "Bank Transfer" },
  { id: "date", label: "Transaction Date", value: "May 15, 2025" },
  { id: "bank", label: "Bank", value: "GTBank" },
] as const;

const formatAmount = (value: number) => {
  const prefix = value >= 0 ? "+" : "-";
  const amount = Math.abs(value).toLocaleString("en-NG", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  return `${prefix}₦${amount}`;
};

const TransactionDetailsScreen = () => {
  const router = useRouter();

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0 pt-6">
      <View className="flex-1">
        <ScrollView
          className="mt-2 flex-1"
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            <View className="rounded-t-lg bg-purpleLight p-6">
              <Text
                weight="semibold"
                className="text-center text-base text-textColor"
              >
                {transactionSummary.title}
              </Text>
              <Text
                weight="bold"
                className="mt-4 text-center text-2xl text-red-400"
              >
                {formatAmount(transactionSummary.amount)}
              </Text>
              <View className="mt-4 items-center">
                <View className="rounded-full bg-white px-4 py-1.5">
                  <Text weight="semibold" className="text-xs text-primary_400">
                    {transactionSummary.bank}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white p-6 shadow-sm">
              <Text weight="semibold" className="text-base text-textColor">
                Transaction Details
              </Text>

              <View className="mt-5 gap-5">
                {transactionDetails.map((detail) => (
                  <View
                    key={detail.id}
                    className="flex-row items-center justify-between"
                  >
                    <Text
                      className="text-sm text-textColor/60"
                      numberOfLines={1}
                    >
                      {detail.label}
                    </Text>
                    <Text
                      weight="semibold"
                      className="text-sm text-textColor"
                      numberOfLines={1}
                    >
                      {detail.value}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="mt-6">
                <Text weight="semibold" className="text-sm text-textColor">
                  Notes
                </Text>
                <View className="mt-2 rounded-lg  bg-lightMuted px-4 py-3">
                  <Text className="text-sm text-textColor">
                    {transactionSummary.note}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-8">
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-lg border border-primary_400 py-4"
              accessibilityRole="button"
            >
              <Image
                source={require("@/assets/icons/download.svg")}
                style={{
                  width: 18,
                  height: 18,
                  tintColor: COLORS.primary_400,
                }}
                contentFit="contain"
              />
              <Text weight="semibold" className="ml-2 text-primary_400">
                Download
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-lg bg-primary_400 py-4"
              accessibilityRole="button"
            >
              <Image
                source={require("@/assets/icons/share.svg")}
                style={{ width: 18, height: 18, tintColor: "#FFFFFF" }}
                contentFit="contain"
              />
              <Text weight="semibold" className="ml-2 text-white">
                Share Receipt
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </MainContainer>
  );
};

export default TransactionDetailsScreen;
