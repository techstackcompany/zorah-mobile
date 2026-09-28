import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";

import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { formatCurrencyWithSymbol } from "@/lib/utils";

const CURRENCY_SYMBOL = "₦";

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const TransferReceiptScreen = () => {
  const params = useLocalSearchParams<{
    recipientName?: string;
    bankName?: string;
    accountNumber?: string;
    amount?: string;
    fee?: string;
    narration?: string;
    transactionId?: string;
  }>();

  const viewShotRef = useRef<ViewShot>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const amountNumber = Number(params.amount) || 0;
  const feeNumber = Number(params.fee) || 0;
  const recipientName = params.recipientName
    ? toTitleCase(params.recipientName)
    : "—";

  const transactionDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  const detailRows = [
    { label: "Recipient Name", value: recipientName },
    { label: "Recipient Account", value: params.accountNumber || "—" },
    { label: "Transaction ID", value: params.transactionId || "—" },
    { label: "Payment Method", value: "Bank Transfer" },
    {
      label: "Amount",
      value: formatCurrencyWithSymbol(amountNumber, CURRENCY_SYMBOL),
      bold: true,
    },
    {
      label: "Fee",
      value: formatCurrencyWithSymbol(feeNumber, CURRENCY_SYMBOL),
    },
    { label: "Transaction Date", value: transactionDate },
    { label: "Bank", value: params.bankName || "—" },
    { label: "Status", value: "Successful", status: true },
  ];

  const handleShare = () => {
    void Share.share({
      message: `Transfer of ${formatCurrencyWithSymbol(amountNumber, CURRENCY_SYMBOL)} to ${recipientName} (${params.bankName ?? ""} ${params.accountNumber ?? ""}) was successful. Transaction ID: ${params.transactionId ?? "—"}.`,
    });
  };

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      if (!viewShotRef.current?.capture) {
        throw new Error("ViewShot ref is not available");
      }

      const uri = await viewShotRef.current.capture();
      const fileName = `receipt_${params.transactionId || Date.now()}.png`;
      const target = new File(Paths.cache, fileName);
      if (!target.exists) {
        new File(uri).copy(target);
      }

      if (!(await Sharing.isAvailableAsync())) {
        Toast.show({
          type: "error",
          text1: "Sharing Unavailable",
          text2: "Saving is not available on this device.",
        });
        return;
      }

      await Sharing.shareAsync(target.uri, {
        mimeType: "image/png",
        dialogTitle: "Save Receipt",
        UTI: "public.png",
      });
    } catch (error) {
      console.error("Receipt download error:", error);
      Toast.show({
        type: "error",
        text1: "Download Failed",
        text2: "Could not prepare receipt. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, params.transactionId]);

  return (
    <MainContainer edges={["bottom"]} className="bg-light px-6 pb-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1 }}
          style={{ backgroundColor: COLORS.light }}
        >
          <View className="rounded-[10px] border border-lightBg">
            {/* Receipt header */}
          <View className="items-center gap-2 rounded-t-[10px] bg-[#EEF4FF] p-4">
            <Text weight="semibold" className="text-base text-textColor">
              {recipientName}
            </Text>
            <Text weight="bold" className="text-2xl text-[#F36F56]">
              -{formatCurrencyWithSymbol(amountNumber, CURRENCY_SYMBOL)}
            </Text>
            {params.bankName ? (
              <View className="rounded-full bg-white px-3 py-1">
                <Text
                  weight="medium"
                  className="text-xs text-primary_400"
                >
                  {params.bankName}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Detail rows */}
          <View className="rounded-b-[10px] bg-white p-4">
            <Text weight="semibold" className="text-lg text-textColor">
              Transaction Details
            </Text>
            <View className="mt-4 gap-4">
              {detailRows.map((row) => (
                <View
                  key={row.label}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-base text-textColor/50">
                    {row.label}
                  </Text>
                  <Text
                    weight={row.bold ? "bold" : "medium"}
                    className={
                      row.status
                        ? "text-base text-[#34C759]"
                        : "text-base text-textColor"
                    }
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
            </View>
          </View>
        </ViewShot>
      </ScrollView>

      <View className="flex-row gap-2.5">
        <Pressable
          onPress={handleDownload}
          disabled={isDownloading}
          className="h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-primary_400 bg-white"
          accessibilityRole="button"
          accessibilityLabel="Download receipt"
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={COLORS.primary_400} />
          ) : (
            <Ionicons name="download" size={18} color={COLORS.primary_400} />
          )}
          <Text weight="medium" className="text-base text-primary_400">
            {isDownloading ? "Preparing..." : "Download"}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleShare}
          className="h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-primary_400"
          accessibilityRole="button"
          accessibilityLabel="Share receipt"
        >
          <Ionicons name="share-social" size={18} color="#FFFFFF" />
          <Text weight="medium" className="text-base text-white">
            Share Receipt
          </Text>
        </Pressable>
      </View>
    </MainContainer>
  );
};

export default TransferReceiptScreen;
