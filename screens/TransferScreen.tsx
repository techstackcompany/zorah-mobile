import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SelectButton from "@/components/ui/SelectButton";
import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import TextInputField from "@/components/ui/TextInputField";
import COLORS from "@/constants/colors";
import { capitalizeWord, cn, formatCurrencyWithSymbol } from "@/lib/utils";
import {
  useGetWalletBalanceQuery,
  useGetWalletBanksQuery,
  useVerifyBankAccountQuery,
} from "@/src/api/hooks";
import { WalletBank } from "@/src/api/types";

const CURRENCY_SYMBOL = "₦";
const ACCOUNT_NUMBER_LENGTH = 10;
const PIN_LENGTH = 4;

type Bank = WalletBank;

// The API returns bank names in ALL CAPS; show them title-cased.
const formatBankName = (name: string) =>
  name.toLowerCase().split(" ").filter(Boolean).map(capitalizeWord).join(" ");

// Deterministic avatar colour from the bank name so the same bank always shows
// the same colour without bundling per-bank logo assets.
const AVATAR_COLORS = [
  "#1A3A8F",
  "#E35205",
  "#6A2C91",
  "#D0021B",
  "#E87722",
  "#0A7C3A",
  "#E2231A",
  "#3AAA35",
  "#1E9CD7",
  "#B7791F",
];

const colorForBank = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const BankAvatar = ({ bank, size = 40 }: { bank: Bank; size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colorForBank(bank.name),
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text weight="bold" className="text-white" style={{ fontSize: size * 0.4 }}>
      {bank.name.charAt(0)}
    </Text>
  </View>
);

const TransferScreen = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const bankPickerRef = useRef<SlideUpModalRef>(null);
  const payRef = useRef<SlideUpModalRef>(null);
  const pinRef = useRef<SlideUpModalRef>(null);

  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [search, setSearch] = useState("");
  const [pin, setPin] = useState("");

  const { data: balanceData } = useGetWalletBalanceQuery();
  const {
    data: banksData,
    isLoading: isLoadingBanks,
    isError: isBanksError,
    refetch: refetchBanks,
  } = useGetWalletBanksQuery();
  const banks = useMemo(() => banksData?.banks ?? [], [banksData]);
  const availableBalance = useMemo(() => {
    const balance = balanceData?.balance ?? 0;
    return typeof balance === "number" ? balance : 0;
  }, [balanceData]);

  // Name enquiry fires once a bank is picked and a full account number is
  // entered (gated inside the hook).
  const {
    data: verifyData,
    isFetching: isVerifyingAccount,
    isError: isVerifyError,
  } = useVerifyBankAccountQuery(selectedBank?.code, accountNumber);
  const resolvedName = verifyData?.accountName ?? null;

  const filteredBanks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return banks;
    return banks.filter((bank) => bank.name.toLowerCase().includes(query));
  }, [search, banks]);

  const amountNumber = Number(amount) || 0;
  const isInsufficient = amountNumber > availableBalance;

  const canContinue =
    !!selectedBank &&
    accountNumber.length === ACCOUNT_NUMBER_LENGTH &&
    !!resolvedName &&
    amountNumber > 0;

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setSearch("");
    bankPickerRef.current?.dismiss();
  };

  const handleContinue = () => {
    payRef.current?.present();
  };

  const handlePay = () => {
    payRef.current?.dismiss();
    setPin("");
    pinRef.current?.present();
  };

  const handlePinChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, PIN_LENGTH);
    setPin(digits);
    if (digits.length === PIN_LENGTH) {
      pinRef.current?.dismiss();
      setPin("");
      // TODO: submit the transfer with the PIN once the transfer API is wired.
      router.push({
        pathname: "/(app)/transfer-success",
        params: {
          recipientName: resolvedName ?? "",
          bankName: selectedBank ? formatBankName(selectedBank.name) : "",
          bankCode: selectedBank?.code ?? "",
          accountNumber,
          amount: String(amountNumber),
          fee: String(transferFee),
          narration: narration.trim(),
          transactionId: `TNX${Date.now().toString().slice(-9)}`,
        },
      });
    }
  };

  // TODO: replace with the fee returned by the transfer quote API when wired.
  const transferFee = 10;

  const transactionDate = useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${mm}/${dd}/${now.getFullYear()}`;
  }, []);

  const confirmationRows = useMemo(
    () => [
      {
        label: "Bank",
        value: selectedBank ? formatBankName(selectedBank.name) : "—",
        withAvatar: true,
      },
      { label: "Account Number", value: accountNumber || "—" },
      { label: "Name", value: resolvedName ?? "—" },
      { label: "Date", value: transactionDate },
      {
        label: "Fee",
        value: formatCurrencyWithSymbol(transferFee, CURRENCY_SYMBOL),
      },
      {
        label: "Amount",
        value: formatCurrencyWithSymbol(amountNumber, CURRENCY_SYMBOL),
        highlight: true,
      },
      { label: "Narration", value: narration.trim() || "None" },
    ],
    [
      selectedBank,
      accountNumber,
      resolvedName,
      transactionDate,
      amountNumber,
      narration,
    ],
  );

  return (
    <MainContainer edges={["bottom"]} className="bg-light pb-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 24,
        }}
      >
        {/* Recipient Bank */}
        <Text className="mb-2 text-sm text-textColor/70">Recipient Bank</Text>
        {selectedBank ? (
          <Pressable
            onPress={() => bankPickerRef.current?.present()}
            className="flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
          >
            <View className="flex-row items-center gap-3">
              <BankAvatar bank={selectedBank} size={28} />
              <Text className="text-base text-textColor">
                {formatBankName(selectedBank.name)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={COLORS.textColor} />
          </Pressable>
        ) : (
          <SelectButton
            placeholder="Select bank"
            onPress={() => bankPickerRef.current?.present()}
          />
        )}

        {/* Recipient Account Number */}
        <Text className="mb-2 mt-5 text-sm text-textColor/70">
          Recipient Account Number
        </Text>
        <TextInputField
          placeholder="Enter acct. number"
          placeholderTextColor={COLORS.textColor + "80"}
          keyboardType="number-pad"
          maxLength={ACCOUNT_NUMBER_LENGTH}
          value={accountNumber}
          onChangeText={(text) => setAccountNumber(text.replace(/[^0-9]/g, ""))}
        />
        {isVerifyingAccount ? (
          <View className="mt-1 flex-row items-center gap-1.5">
            <ActivityIndicator size="small" color={COLORS.primary_400} />
            <Text className="text-[10px] text-textColor/50">
              Verifying account...
            </Text>
          </View>
        ) : isVerifyError ? (
          <Text weight="semibold" className="mt-1 text-[10px] text-error">
            Couldn&apos;t verify this account. Check the bank and account
            number.
          </Text>
        ) : resolvedName ? (
          <Text
            weight="semibold"
            className="mt-1 text-[10px] uppercase text-primary_400"
          >
            {resolvedName}
          </Text>
        ) : null}

        {/* Amount */}
        <View className="mt-5">
          <AmountInput
            label="Amount"
            value={amount}
            onChangeValue={setAmount}
            currencySymbol={CURRENCY_SYMBOL}
          />
        </View>

        {/* Narration */}
        <Text className="mb-2 mt-5 text-sm text-textColor/70">Narration</Text>
        <TextInputField
          placeholder="Enter narration"
          placeholderTextColor={COLORS.textColor + "80"}
          value={narration}
          onChangeText={setNarration}
        />
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: bottom + 12,
          paddingTop: 8,
        }}
      >
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={handleContinue}
        />
      </View>

      {/* Bank picker */}
      <SlideUpModal
        ref={bankPickerRef}
        title="Select Bank"
        headerTextColor={COLORS.white}
        closeIconColor={COLORS.white}
        snapPoints={["75%"]}
        enableDynamicSizing={false}
        
        onClose={() => setSearch("")}
        className="px-0 py-0"
      >
        <View className="px-5 pt-4">
          <TextInputField
            placeholder="Search"
            placeholderTextColor={COLORS.textColor + "80"}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <BottomSheetScrollView
          style={{ maxHeight:'90%' }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {isLoadingBanks ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary_400}
              className="mt-8"
            />
          ) : isBanksError ? (
            <View className="mt-8 items-center gap-3">
              <Text className="text-center text-sm text-textColor/50">
                Couldn&apos;t load banks. Check your connection and try again.
              </Text>
              <Pressable
                onPress={() => refetchBanks()}
                className="rounded-full border border-primary_400 px-5 py-2"
              >
                <Text weight="semibold" className="text-sm text-primary_400">
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Bank codes are not unique in the API response (e.g. 050023
                  is shared by two banks), so key by code + name. */}
              {filteredBanks.map((bank) => (
                <Pressable
                  key={`${bank.code}-${bank.name}`}
                  onPress={() => handleSelectBank(bank)}
                  className="flex-row items-center gap-4 py-3"
                >
                  <BankAvatar bank={bank} />
                  <Text className="text-base text-textColor">
                    {formatBankName(bank.name)}
                  </Text>
                </Pressable>
              ))}
              {filteredBanks.length === 0 ? (
                <Text className="mt-6 text-center text-sm text-textColor/50">
                  No banks found
                </Text>
              ) : null}
            </>
          )}
        </BottomSheetScrollView>
      </SlideUpModal>

      {/* Confirm transaction details */}
      <SlideUpModal
        ref={payRef}
        snapPoints={["68%"]}
        className="px-6 pb-6 pt-2"
      >
        <View className="mb-2 flex-row justify-end">
          <Pressable onPress={() => payRef.current?.dismiss()} hitSlop={16}>
            <Ionicons name="close" size={22} color={COLORS.textColor} />
          </Pressable>
        </View>

        <Text
          weight="semibold"
          className="text-center text-base text-textColor"
        >
          Confirm Transaction Details
        </Text>

        <View className="mt-6 rounded-[10px] border border-lightBg bg-white p-4">
          {confirmationRows.map((row, index) => (
            <View
              key={row.label}
              className={cn(
                "flex-row items-center justify-between",
                index > 0 && "mt-4",
              )}
            >
              <Text className="text-base text-textColor/50">{row.label}</Text>
              {row.withAvatar && selectedBank ? (
                <View className="flex-row items-center gap-1.5">
                  <BankAvatar bank={selectedBank} size={16} />
                  <Text className="text-base text-textColor">{row.value}</Text>
                </View>
              ) : (
                <Text
                  weight={row.highlight ? "semibold" : "medium"}
                  className={cn(
                    "text-base",
                    row.highlight ? "text-primary_400" : "text-textColor",
                  )}
                >
                  {row.value}
                </Text>
              )}
            </View>
          ))}
        </View>

        {isInsufficient ? (
          <View className="mt-4 flex-row items-center justify-between">
            <Text weight="semibold" className="text-sm text-error">
              Insufficient Balance
            </Text>
            <Pressable
              onPress={() => {
                payRef.current?.dismiss();
                router.navigate("/(app)/fund-wallet");
              }}
              className="flex-row items-center gap-1"
            >
              <Text weight="semibold" className="text-sm text-primary_400">
                Add Money
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={COLORS.primary_400}
              />
            </Pressable>
          </View>
        ) : null}

        <PrimaryButton
          label="Pay"
          className="mt-6"
          disabled={isInsufficient || amountNumber <= 0}
          onPress={handlePay}
        />
      </SlideUpModal>

      {/* Transaction PIN */}
      <SlideUpModal
        ref={pinRef}
        snapPoints={["55%"]}
        className="px-6 pb-6 pt-2"
        onClose={() => setPin("")}
      >
        <View className="mb-2 flex-row justify-end">
          <Pressable onPress={() => pinRef.current?.dismiss()} hitSlop={16}>
            <Ionicons name="close" size={22} color={COLORS.textColor} />
          </Pressable>
        </View>

        <Text
          weight="bold"
          className="text-center text-2xl text-textColor"
        >
          Enter Transaction PIN
        </Text>

        <View className="mt-10">
          <TextInputField
            placeholder="Enter PIN"
            placeholderTextColor={COLORS.textColor + "80"}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={PIN_LENGTH}
            value={pin}
            onChangeText={handlePinChange}
            autoFocus
          />
        </View>
      </SlideUpModal>
    </MainContainer>
  );
};

export default TransferScreen;
