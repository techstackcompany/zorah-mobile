import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SelectButton from "@/components/ui/SelectButton";
import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import TextInputField from "@/components/ui/TextInputField";
import COLORS from "@/constants/colors";
import { formatCurrencyWithSymbol } from "@/lib/utils";
import { useGetWalletBalanceQuery } from "@/src/api/hooks";

const CURRENCY_SYMBOL = "₦";
const ACCOUNT_NUMBER_LENGTH = 10;

type Bank = {
  id: string;
  name: string;
};

// Banks are supplied by the banks API (not wired up yet). Empty until then —
// the picker handles the empty state, and no bank data is hardcoded.
const banks: Bank[] = [];

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
  const { height: windowHeight } = useWindowDimensions();

  const bankPickerRef = useRef<SlideUpModalRef>(null);
  const payRef = useRef<SlideUpModalRef>(null);

  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [search, setSearch] = useState("");

  const { data: balanceData } = useGetWalletBalanceQuery();
  const availableBalance = useMemo(() => {
    const balance = balanceData?.balance ?? 0;
    return typeof balance === "number" ? balance : 0;
  }, [balanceData]);

  // Name enquiry is resolved once a bank is picked and a full account number is
  // entered. The lookup endpoint isn't wired yet, so we surface a placeholder
  // name to complete the flow. TODO: replace with the bank name-enquiry API.
  const resolvedName = useMemo(() => {
    if (selectedBank && accountNumber.length === ACCOUNT_NUMBER_LENGTH) {
      return "ADEMOLA ADAMS";
    }
    return null;
  }, [selectedBank, accountNumber]);

  const filteredBanks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return banks;
    return banks.filter((bank) => bank.name.toLowerCase().includes(query));
  }, [search]);

  const amountNumber = Number(amount) || 0;
  const isInsufficient = amountNumber > availableBalance;

  const canContinue =
    !!selectedBank &&
    accountNumber.length === ACCOUNT_NUMBER_LENGTH &&
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
    Toast.show({
      type: "success",
      text1: "Transfer initiated",
      text2: `${formatCurrencyWithSymbol(amountNumber, CURRENCY_SYMBOL)} to ${resolvedName ?? "recipient"}`,
    });
  };

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
                {selectedBank.name}
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
        {resolvedName ? (
          <Text
            weight="semibold"
            className="mt-2 text-xs uppercase text-primary_400"
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
          style={{ maxHeight: windowHeight * 0.55 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {filteredBanks.map((bank) => (
            <Pressable
              key={bank.id}
              onPress={() => handleSelectBank(bank)}
              className="flex-row items-center gap-4 py-3"
            >
              <BankAvatar bank={bank} />
              <Text className="text-base text-textColor">{bank.name}</Text>
            </Pressable>
          ))}
          {filteredBanks.length === 0 ? (
            <Text className="mt-6 text-center text-sm text-textColor/50">
              No banks found
            </Text>
          ) : null}
        </BottomSheetScrollView>
      </SlideUpModal>

      {/* Pay confirmation */}
      <SlideUpModal
        ref={payRef}
        snapPoints={["42%"]}
        className="px-6 pb-6 pt-2"
      >
        <View className="mb-4 flex-row justify-end">
          <Pressable onPress={() => payRef.current?.dismiss()} hitSlop={16}>
            <Ionicons name="close" size={22} color={COLORS.textColor} />
          </Pressable>
        </View>

        <Text
          weight="bold"
          family="degular"
          className="text-center text-3xl text-textColor"
        >
          {formatCurrencyWithSymbol(amountNumber, CURRENCY_SYMBOL)}
        </Text>

        <View className="mt-6 rounded-2xl bg-primary_200/50 p-4">
          {isInsufficient ? (
            <Text weight="semibold" className="text-sm text-error">
              Insufficient Balance
            </Text>
          ) : null}
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm text-textColor/70">
              Available Balance:
            </Text>
            <Text weight="semibold" className="text-sm text-textColor">
              {formatCurrencyWithSymbol(availableBalance, CURRENCY_SYMBOL)}
            </Text>
          </View>
          {isInsufficient ? (
            <Pressable
              onPress={() => {
                payRef.current?.dismiss();
                router.navigate("/(app)/fund-wallet");
              }}
              className="mt-2 flex-row items-center justify-end gap-1"
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
          ) : null}
        </View>

        <PrimaryButton
          label="Pay"
          className="mt-6"
          disabled={isInsufficient || amountNumber <= 0}
          onPress={handlePay}
        />
      </SlideUpModal>
    </MainContainer>
  );
};

export default TransferScreen;
