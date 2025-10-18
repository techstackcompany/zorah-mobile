import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

type Bank = {
  id: string;
  label: string;
};

const banks: Bank[] = [
  { id: "gtb", label: "GTBank" },
  { id: "zenith", label: "Zenith Bank" },
  { id: "access", label: "Access Bank" },
  { id: "first", label: "First Bank" },
  { id: "uba", label: "UBA" },
  { id: "kuda", label: "Kuda Bank" },
  { id: "opay", label: "Opay" },
  { id: "palmpay", label: "PalmPay" },
  { id: "moniepoint", label: "Moniepoint" },
  { id: "jaiz", label: "Jaiz Bank" },
  { id: "fidelity", label: "Fidelity Bank" },
  { id: "fcmb", label: "FCMB" },
];

const YourBanksScreen = () => {
  const router = useRouter();
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);

  const toggleBank = (bankId: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bankId)
        ? prev.filter((id) => id !== bankId)
        : [...prev, bankId],
    );
  };

  const handlePrevious = () => {
    router.back();
  };

  const handleNext = () => {
    router.push("/(auth)/setup/summary");
  };

  return (
    <SetupContainer className="bg-light">
      <View className="flex-1">
        <SetupHeader
          currentStep={3}
          totalSteps={4}
          title="Your Banks"
          description="Select your banks to enable automatic expense tracking"
        />

        <View className="flex-1 px-6 pb-6">
          <View className="mt-6 flex-row flex-wrap justify-between">
            {banks.map((bank) => {
              const selected = selectedBanks.includes(bank.id);
              return (
                <Pressable
                  key={bank.id}
                  onPress={() => toggleBank(bank.id)}
                  className={cn(
                    "mb-4 w-[48%] flex-row items-center  gap-4 rounded-2xl border bg-white px-5 py-4 border-[#E2E8F0]",
                    selected && "bg-primary_100",
                  )}
                >
                  <View
                    className={cn(
                      "h-7 w-7 items-center justify-center rounded-md border border-grey",
                      selected && "border-primary_400 border-2",
                    )}
                  >
                    {/* {selected ? (
                      <View className="h-2.5 w-2.5 rounded-[3px] bg-white" />
                    ) : null} */}
                  </View>
                  <Text weight="semibold" className="text-base text-textColor">
                    {bank.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-auto flex-row gap-4 pt-10">
            <Button
              title="Previous"
              variant="outline"
              className="flex-1"
              onPress={handlePrevious}
            />
            <Button
              title="Next"
              className="flex-1"
              onPress={handleNext}
              disabled={selectedBanks.length === 0}
            />
          </View>
        </View>
      </View>
    </SetupContainer>
  );
};

export default YourBanksScreen;
