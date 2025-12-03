import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { formatCurrency, formatTransactionPurpose } from "@/lib/utils";
import { useGetWalletTransactionsQuery } from "@/src/api/hooks";
import { WalletTransaction } from "@/src/api/types";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

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
    transaction?.description ||
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
  console.log("transactionsData", transactionsData);
  const renderContent = () => {
    if (isLoading && !transactionsData?.data) {
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
                  <Text weight="semibold" className="text-xs text-primary_400">
                    {chipLabel}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white p-6 shadow-sm">
              <Text weight="semibold" className="text-base text-textColor">
                Transaction Details
              </Text>

              <View className="mt-5 gap-5">
                {detailRows.map((detail) => (
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
                    {transaction.description ||
                      "No notes added for this transaction."}
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
