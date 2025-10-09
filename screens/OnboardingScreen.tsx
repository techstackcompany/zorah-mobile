import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Image, ImageStyle } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type Slide = {
  id: number;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  image: any;
  imagePosition?: string;
  bgColor?: string;
  imageStyle?: ImageStyle;
};

const slides: Slide[] = [
  {
    id: 1,
    title: "Money management made",
    highlight: "simple",
    subtitle: "Money Management",
    bgColor: COLORS.primaryFaint,
    description:
      "PocketMonie helps you track budgets, set savings goals, and stay in control of your money.",
    image: require("../assets/images/onboarding/image1.png"),
  },
  {
    id: 2,
    title: "Shop smarter, save",
    highlight: "bigger",
    subtitle: "MarketPlace",
    bgColor: COLORS.secondaryFaint,
    description:
      "Shop local, save more. PocketMonie MarketPlace brings you the best deals while supporting local vendors.",
    image: require("../assets/images/onboarding/image2.png"),
  },
  {
    id: 3,
    title: "Shop smarter, save",
    highlight: "bigger",
    subtitle: "MarketPlace",
    bgColor: COLORS.primaryFaint,
    imagePosition: "right bottom",
    description:
      "Shop local, save more. PocketMonie MarketPlace brings you the best deals while supporting local vendors.",
    image: require("../assets/images/onboarding/image3.png"),
  },
  {
    id: 4,
    title: "Budget smart for every",
    highlight: "celebration",
    subtitle: "MarketPlace",
    imageStyle: { transform: "translateX(10%)" },
    description:
      "From aso ebi to transport and gifts, keep your event expenses simple, organized and debt-free.",
    image: require("../assets/images/onboarding/image4.png"),
  },
];
const lastIndex = slides.length - 1;
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      console.log("Navigate to main app screen");
    }
  };
  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({ index: lastIndex, animated: false });
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View className="flex-1 items-center pb-10" style={{ width }}>
            {/* Illustration */}

            <View
              style={{
                paddingTop: 24,
                backgroundColor: item.bgColor,
                flex: 1,
                width: "100%",
              }}
            >
              <Image
                source={item.image}
                style={{ width: "100%", height: "100%", ...item?.imageStyle }}
                contentFit="contain"
                contentPosition={item?.imagePosition ?? "center"}
              />
            </View>

            <View className="flex-1 px-6">
              <View className="mb-5 mt-10 flex-row justify-between">
                {/* Pagination Dots */}
                <View className="flex-1  flex-row items-center justify-start space-x-3 ">
                  {slides.map((_, index) => (
                    <View
                      key={index}
                      className={cn(
                        "mx-1 h-2 w-1/6 max-w-24 rounded-full",
                        index === currentIndex ? " bg-secondary" : "bg-gray",
                      )}
                    />
                  ))}
                </View>

                {/* Skip */}
                {currentIndex !== slides.length - 1 && (
                  <TouchableOpacity onPress={handleSkip}>
                    <Text className=" ">Skip</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Text */}
              <View className="mt-3">
                <Text
                  family="degular"
                  weight="semibold"
                  className="text-center text-[38px] leading-tight"
                >
                  {item.title}{" "}
                  <Text
                    family="degular"
                    weight="semibold"
                    className="text-secondary"
                  >
                    {item.highlight}
                  </Text>
                </Text>
                <Text className=" trac mt-3 text-center font-nunito leading-relaxed">
                  {item.description}
                </Text>
              </View>

              {/* CTA */}
              <Button
                className="mt-auto"
                title={
                  currentIndex === slides.length - 1 ? "Finish" : "Get Started"
                }
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
