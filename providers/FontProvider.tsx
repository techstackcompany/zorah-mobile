import React, { PropsWithChildren, useEffect } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const FontProvider = ({ children }: PropsWithChildren) => {
  const [fontsLoaded] = useFonts({
    // Degular family
    DegularRegular: require("../assets/fonts/degular-regular.otf"),
    DegularMedium: require("../assets/fonts/degular-medium.otf"),
    DegularMediumItalic: require("../assets/fonts/degular-medium_italic.otf"),
    DegularSemibold: require("../assets/fonts/degular-semibold.otf"),
    DegularSemiboldItalic: require("../assets/fonts/degular-semibold_italic.otf"),
    DegularBold: require("../assets/fonts/degular-bold.otf"),
    DegularBoldItalic: require("../assets/fonts/degular-bold_italic.otf"),

    // Nunito Sans family
    NunitoRegular: require("../assets/fonts/nunito-sans-regular.ttf"),
    NunitoRegularItalic: require("../assets/fonts/nunito-sans-regular_italic.ttf"),
    NunitoMedium: require("../assets/fonts/nunito-sans-medium.ttf"),
    NunitoMediumItalic: require("../assets/fonts/nunito-sans-medium_italic.ttf"),
    NunitoSemibold: require("../assets/fonts/nunito-sans-semibold.ttf"),
    NunitoSemiboldItalic: require("../assets/fonts/nunito-sans-semibold_italic.ttf"),
    NunitoBold: require("../assets/fonts/nunito-sans-bold.ttf"),
    NunitoBoldItalic: require("../assets/fonts/nunito-sans-bold_italic.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return <View />;

  return <>{children}</>;
};

export default FontProvider;
