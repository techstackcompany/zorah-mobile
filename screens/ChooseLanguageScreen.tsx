import SetupContainer from "@/components/layouts/SetupContainer";
import SelectableCard from "@/components/setup/SelectableCard";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

const ChooseLanguageScreen = () => {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const languages = [
    {
      id: "en",
      title: "English",
      subtitle: "British English",
    },
    {
      id: "yo",
      title: "Yoruba",
      subtitle: "Yoruba",
    },
    {
      id: "ha",
      title: "Hausa",
      subtitle: "Hausa",
    },
    {
      id: "ig",
      title: "Igbo",
      subtitle: "Igbo",
    },
  ];

  const handleNext = () => {
    router.push("/(auth)/setup/monthly-income");
  };

  return (
    <SetupContainer>
      <View className="flex-1">
        <SetupHeader
          currentStep={1}
          totalSteps={4}
          title="Choose Your Language"
          description="Select your preferred language for the app"
        />

        <View className="flex-1 px-6 pb-6">
          <View className="">
            {languages.map((language) => (
              <SelectableCard
                key={language.id}
                title={language.title}
                subtitle={language.subtitle}
                selected={selectedLanguage === language.id}
                onPress={() => setSelectedLanguage(language.id)}
              />
            ))}
          </View>

          <View className="mt-auto pt-10">
            <Button title="Next" onPress={handleNext} />
          </View>
        </View>
      </View>
    </SetupContainer>
  );
};

export default ChooseLanguageScreen;
