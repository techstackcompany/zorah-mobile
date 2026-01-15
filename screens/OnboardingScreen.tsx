import MainContainer from "@/components/layouts/MainContainer";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { slides } from "@/constants/onboarding";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const lastIndex = slides.length - 1;
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const isLastSlide = currentIndex === slides.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleNext = () => {
    if (!isLastSlide) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace("/welcome");
    }
  };
  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({ index: lastIndex, animated: false });
  };
  return (
    <MainContainer>
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
          <View className="flex-1 items-center " style={{ width }}>
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
                <View className="flex-1  flex-row items-center justify-start space-x-3 ">
                  {slides.map((_, index) => (
                    <View
                      key={index}
                      className={cn(
                        "mx-1 h-2 w-1/6 max-w-24 rounded-full",
                        index === currentIndex
                          ? " bg-secondary_400"
                          : "bg-grey",
                      )}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleSkip}
                  disabled={currentIndex === slides.length - 1}
                  className={cn(
                    currentIndex === slides.length - 1 && "opacity-0",
                  )}
                >
                  <Text className=" ">Skip</Text>
                </TouchableOpacity>
              </View>

              <View className="mt-3">
                <Text
                  family="degular"
                  weight="semibold"
                  className="mb-3 text-center text-[38px] leading-tight"
                >
                  {item.title}{" "}
                  <Text
                    family="degular"
                    weight="semibold"
                    className="text-secondary_400"
                  >
                    {item.highlight}
                  </Text>
                </Text>
                <Text className="mt-3 text-center font-nunito text-lg leading-relaxed tracking-wide sm:text-xl">
                  {item.description}
                </Text>
              </View>

              <Button
                onPress={handleNext}
                className="mt-auto"
                title={isLastSlide ? "Finish" : "Get Started"}
              />
            </View>
          </View>
        )}
      />
    </MainContainer>
  );
}
