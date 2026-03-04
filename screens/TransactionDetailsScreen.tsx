import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn, formatCurrency, formatTransactionPurpose } from "@/lib/utils";
import { useGetWalletTransactionsQuery } from "@/src/api/hooks";
import { WalletTransaction } from "@/src/api/types";
import { File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";

const formatAmountWithSign = (value: number): string => {
  if (value === 0) return formatCurrency(0);
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
};

const formatDateTime = (date?: string) => {
  if (!date) return "—";
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TransactionDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const transactionId = Array.isArray(id) ? id[0] : id;

  const { data: transactionsData, isLoading } = useGetWalletTransactionsQuery();

  const transaction: WalletTransaction | undefined = useMemo(() => {
    if (!transactionId || !transactionsData?.data) return undefined;
    return transactionsData.data.find((item) => item._id === transactionId);
  }, [transactionId, transactionsData]);

  const isCredit = transaction?.type === "credit";
  const signedAmount = transaction
    ? isCredit
      ? Math.abs(transaction.amount)
      : -Math.abs(transaction.amount)
    : 0;
  const title =
    transaction?.metadata?.description ||
    (transaction?.purpose
      ? formatTransactionPurpose(transaction.purpose)
      : "Transaction Details");
  const chipLabel =
    transaction?.purpose && formatTransactionPurpose(transaction.purpose)
      ? formatTransactionPurpose(transaction.purpose)
      : transaction?.type === "credit"
        ? "Credit"
        : transaction?.type === "debit"
          ? "Debit"
          : "Transaction";

  const detailRows = [
    {
      id: "reference",
      label: "Transaction Reference",
      value: transaction?.reference ?? "—",
    },
    {
      id: "type",
      label: "Type",
      value: transaction
        ? transaction.type === "credit"
          ? "Credit"
          : "Debit"
        : "—",
    },
    {
      id: "purpose",
      label: "Purpose",
      value: transaction?.purpose
        ? formatTransactionPurpose(transaction.purpose)
        : "—",
    },
    {
      id: "date",
      label: "Transaction Date",
      value: formatDateTime(transaction?.createdAt),
    },
    {
      id: "amount",
      label: "Amount",
      value: formatAmountWithSign(signedAmount),
    },
  ] as const;

  const viewShotRef = useRef<ViewShot>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const captureReceipt = useCallback(async (): Promise<string | null> => {
    try {
      if (!viewShotRef.current?.capture) {
        throw new Error("ViewShot ref is not available");
      }
      const uri = await viewShotRef.current.capture();
      return uri;
    } catch (error) {
      console.error("Error capturing receipt:", error);
      return null;
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const uri = await captureReceipt();
      if (!uri) {
        throw new Error("Failed to capture receipt");
      }

      const fileName = `receipt_${transaction?.reference || Date.now()}.png`;
      const fileUri = new File(Paths.cache, fileName);
      const receipt = new File(uri);
      if (!fileUri.exists) {
        receipt.copy(fileUri);
      }

      // Use system share sheet to save the receipt
      await Sharing.shareAsync(fileUri.uri, {
        mimeType: "image/png",
        dialogTitle: "Save Receipt",
        UTI: "public.png",
      });

      Toast.show({
        type: "success",
        text1: "Receipt Ready",
        text2: "Use the share menu to save to your gallery",
      });
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: "error",
        text1: "Download Failed",
        text2: "Could not prepare receipt. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, captureReceipt, transaction?.reference]);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: "error",
          text1: "Sharing Unavailable",
          text2: "Sharing is not available on this device",
        });
        setIsSharing(false);
        return;
      }

      const uri = await captureReceipt();
      if (!uri) {
        throw new Error("Failed to capture receipt");
      }

      const fileName = `receipt_${transaction?.reference || Date.now()}.png`;
      const fileUri = new File(Paths.cache, fileName);
      const receipt = new File(uri);
      if (!fileUri.exists) {
        receipt.copy(fileUri);
      }
      await Sharing.shareAsync(fileUri.uri, {
        mimeType: "image/png",
        dialogTitle: "Share Transaction Receipt",
      });
    } catch (error) {
      console.error("Share error:", error);
      Toast.show({
        type: "error",
        text1: "Share Failed",
        text2: "Could not share receipt. Please try again.",
      });
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, captureReceipt, transaction?.reference]);

  const renderContent = () => {
    if (isLoading && !transactionsData) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-3 text-textColor/60">Loading transaction...</Text>
        </View>
      );
    }

    if (!transactionId) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={require("@/assets/images/home/no-recent-trans.svg")}
            style={{ width: 170, height: 162 }}
            contentFit="contain"
          />
          <Text weight="semibold" className="mt-4 text-base text-textColor">
            No transaction selected
          </Text>
          <Text className="mt-1 text-center text-sm text-textColor/60">
            Select a transaction from your history to view its details.
          </Text>
        </View>
      );
    }

    if (!transaction) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={require("@/assets/images/home/no-recent-trans.svg")}
            style={{ width: 170, height: 162 }}
            contentFit="contain"
          />
          <Text weight="semibold" className="mt-4 text-base text-textColor">
            Transaction not found
          </Text>
          <Text className="mt-1 text-center text-sm text-textColor/60">
            We could not find details for this transaction. Please try again.
          </Text>
        </View>
      );
    }

    return (
      <>
        <ScrollView
          className="mt-2 flex-1"
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
            <View className="px-6">
              <View className="rounded-t-lg bg-purpleLight p-6">
                <Text
                  weight="semibold"
                  className="text-center text-base text-textColor"
                >
                  {title}
                </Text>
                <Text
                  weight="bold"
                  className="mt-4 text-center text-2xl"
                  style={{
                    color: signedAmount >= 0 ? COLORS.secondary_500 : "#D14343",
                  }}
                >
                  {formatAmountWithSign(signedAmount)}
                </Text>
                <View className="mt-4 items-center">
                  <View className="rounded-full bg-white px-4 py-1.5">
                    <Text
                      weight="semibold"
                      className="text-xs text-primary_400"
                    >
                      {chipLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white p-6 shadow-sm">
                <Text weight="semibold" className="text-base text-textColor">
                  Transaction Details
                </Text>

                <View className="f mt-5 gap-5">
                  {detailRows.map((detail) => (
                    <View
                      key={detail.id}
                      className="flex-row flex-wrap items-center justify-between"
                    >
                      <Text
                        className="text-sm text-textColor/60"
                        numberOfLines={1}
                      >
                        {detail.label}
                      </Text>
                      <Text
                        weight="semibold"
                        selectable
                        className={cn(
                          "text-sm text-textColor",
                          detail.label === "Transaction Reference" &&
                            "py-2 text-primary_400",
                        )}
                        numberOfLines={1}
                      >
                        {detail.value}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="mt-6">
                  <Text weight="semibold" className="text-sm text-textColor">
                    Description
                  </Text>
                  <View className="mt-2 rounded-lg  bg-lightMuted px-4 py-3">
                    <Text className="text-sm text-textColor">
                      {transaction.metadata?.description ||
                        "No description added for this transaction."}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ViewShot>
        </ScrollView>

        <View className="px-6 pb-8">
          <View className="flex-row gap-3">
            <Pressable
              className={cn(
                "flex-1 flex-row items-center justify-center rounded-lg border border-primary_400 py-4",
                isDownloading && "opacity-50",
              )}
              accessibilityRole="button"
              onPress={handleDownload}
              disabled={isDownloading || isSharing}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color={COLORS.primary_400} />
              ) : (
                <>
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
                </>
              )}
            </Pressable>
            <Pressable
              className={cn(
                "flex-1 flex-row items-center justify-center rounded-lg bg-primary_400 py-4",
                isSharing && "opacity-50",
              )}
              accessibilityRole="button"
              onPress={handleShare}
              disabled={isDownloading || isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Image
                    source={require("@/assets/icons/share.svg")}
                    style={{ width: 18, height: 18, tintColor: "#FFFFFF" }}
                    contentFit="contain"
                  />
                  <Text weight="semibold" className="ml-2 text-white">
                    Share Receipt
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </>
    );
  };

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0 pt-6">
      <View className="flex-1">{renderContent()}</View>
    </MainContainer>
  );
};

export default TransactionDetailsScreen;
