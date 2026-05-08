import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Alert, Linking, Pressable, TextInput, View } from "react-native";

type BankOption = {
  id: string;
  name: string;
  ussdCode: string;
};

const bankOptions: BankOption[] = [
  { id: "access", name: "Access Bank", ussdCode: "*901*000*2360#" },
  { id: "ecobank", name: "Ecobank Nigeria Plc", ussdCode: "*326#" },
  { id: "fcmb", name: "FCMB", ussdCode: "*329*amount*account#" },
  { id: "fidelity", name: "Fidelity Bank", ussdCode: "*770*" },
  {
    id: "first-bank",
    name: "First Bank Of Nigeria",
    ussdCode: "*894*amount*account#",
  },
  { id: "globus", name: "Globus Bank", ussdCode: "*989#" },
  {
    id: "gtbank",
    name: "Guaranty Trust Bank",
    ussdCode: "*737*1*amount*account#",
  },
  { id: "heritage", name: "Heritage Bank", ussdCode: "*745#" },
  { id: "keystone", name: "Keystone Bank", ussdCode: "*7111#" },
  { id: "zenith", name: "Zenith Bank", ussdCode: "*966*amount*account#" },
];

const formatAmount = (rawValue?: string) => {
  const value = Number(rawValue || "0");
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const BankUssdScreen = () => {
  const { amount } = useLocalSearchParams<{ amount?: string }>();
  const modalRef = useRef<SlideUpModalRef>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankOption | null>(null);

  const formattedAmount = useMemo(() => formatAmount(amount), [amount]);

  const handleSelectBank = (bank: BankOption) => {
    setSelectedBank(bank);
    modalRef.current?.dismiss();
    setSearchTerm("");
  };

  const filteredBanks = useMemo(() => {
    if (!searchTerm) return bankOptions;
    const term = searchTerm.toLowerCase();
    return bankOptions.filter((bank) => bank.name.toLowerCase().includes(term));
  }, [searchTerm]);

  const handleDialCode = async () => {
    if (!selectedBank) {
      return;
    }

    const encoded = selectedBank.ussdCode.replace(/#/g, "%23");
    const url = `tel:${encoded}`;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(
        "Cannot Dial",
        "USSD dialing is not supported on this device.",
      );
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Dial Failed", "Unable to dial the USSD code right now.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Bank USSD" }} />
      <MainContainer edges={["top"]} className="bg-lightMuted">
        <View className="flex-1 px-6 pt-6">
          <View className="flex-row items-baseline">
            <Text className="text-base text-textColor/70">Amount payable:</Text>
            <Text weight="semibold" className="ml-2 text-base text-textColor">
              {formattedAmount}
            </Text>
          </View>

          <View className="mt-6">
            <Text className="text-base text-textColor/80">Bank</Text>
            <Pressable
              onPress={() => modalRef.current?.present()}
              className="mt-3 flex-row items-center justify-between rounded-2xl border border-grayLight/80 bg-white px-4 py-4"
              accessibilityRole="button"
            >
              <Text
                weight="semibold"
                className={`text-base ${selectedBank ? "text-textColor" : "text-textColor/50"}`}
              >
                {selectedBank ? selectedBank.name : "Select bank"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={selectedBank ? "#6B7280" : "#B0B7C3"}
              />
            </Pressable>
          </View>

          {selectedBank ? (
            <View className="mt-8 rounded-3xl border border-grayLight/80 bg-white px-5 py-6 shadow-sm">
              <Text className="text-sm text-textColor/60">
                {selectedBank.name}
              </Text>
              <Text weight="bold" className="mt-4 text-3xl text-textColor">
                {selectedBank.ussdCode}
              </Text>
              <Pressable
                onPress={handleDialCode}
                className="mt-8 flex-row items-center justify-center rounded-xl bg-primary_400 py-3"
                accessibilityRole="button"
              >
                <Ionicons name="call-outline" size={18} color="#FFFFFF" />
                <Text weight="semibold" className="ml-2 text-white">
                  Dial Code
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </MainContainer>

      <SlideUpModal
        ref={modalRef}
        title="Bank"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#FFFFFF"
        closeIconColor="#FFFFFF"
        height="70%"
        className="pt-2"
      >
        <View className="rounded-2xl  px-4 py-3">
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/icons/search.svg")}
              style={{ width: 24, height: 24 }}
            />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search bank name..."
              placeholderTextColor="#9AA5B1"
              className="ml-2 flex-1 font-degular  text-textColor"
            />
          </View>
        </View>

        <View className="mt-5">
          {filteredBanks.map((bank) => (
            <Pressable
              key={bank.id}
              onPress={() => handleSelectBank(bank)}
              accessibilityRole="button"
              className="flex-row items-center justify-between border-b border-grayLight/60 py-4"
            >
              <Text className="text-base text-textColor">{bank.name}</Text>
              <Ionicons name="chevron-forward" size={18} color="#B0B7C3" />
            </Pressable>
          ))}
          {filteredBanks.length === 0 ? (
            <Text className="py-6 text-center text-sm text-textColor/60">
              No banks found.
            </Text>
          ) : null}
        </View>
      </SlideUpModal>
    </>
  );
};

export default BankUssdScreen;
