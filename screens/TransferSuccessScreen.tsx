import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

import MainContainer from "@/components/layouts/MainContainer";
import Button from "@/components/ui/Button";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Text from "@/components/ui/Text";
import { formatCurrencyWithSymbol } from "@/lib/utils";

const CURRENCY_SYMBOL = "₦";


type LocalURlProps  ={
    recipientName?: string;
    bankName?: string;
    accountNumber?: string;
    amount?: string;
    narration?: string;
    transactionId?: string;
    /** Server-reported state. Bank payouts can settle asynchronously. */
    status?: string;
  }

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const TransferSuccessScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<LocalURlProps>();

  const amountNumber = Number(params.amount) || 0;
  const firstName = params.recipientName
    ? toTitleCase(params.recipientName).split(" ")[0]
    : "recipient";
  // Do not claim success for a transfer the backend only queued.
  const isPending = /pending|processing/i.test(params.status ?? "");

  return (
    <MainContainer edges={["top", "bottom"]} className="bg-light px-6 pb-4">
      <View className="flex-1 items-center justify-center">
        <Image
          source={require("@/assets/images/transfer-success.svg")}
          style={{ width: 238, height: 231 }}
          contentFit="contain"
        />
        <Text
          weight="semibold"
          className="mt-12 text-center text-[32px] leading-10 text-textColor"
        >
          {isPending ? "Transfer Sent" : "Transaction Successful"}
        </Text>
        <Text className="mt-4 max-w-[350px] text-center text-base text-textColor">
          Transfer of{" "}
          <Text weight="bold" className="text-base text-textColor">
            {formatCurrencyWithSymbol(amountNumber, CURRENCY_SYMBOL)}
          </Text>{" "}
          to {firstName} {isPending ? "is being processed." : "was successful."}
        </Text>
      </View>

      <View className="gap-2">
        <PrimaryButton
          label="Go to Dashboard"
          onPress={() => router.replace("/(app)/(home)")}
        />
        <Button
          title="View Receipt"
          variant="outline"
          size="md"
          className="h-[52px] rounded-2xl"
          onPress={() =>
            router.push({
              pathname: "/(app)/transfer-receipt",
              params,
            })
          }
        />
      </View>
    </MainContainer>
  );
};

export default TransferSuccessScreen;
