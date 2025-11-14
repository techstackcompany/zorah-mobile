import COLORS from "@/constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
const CODE_FIELDS = 4;
const OFFSET = 20;
const TIME = 80;
const LockScreen = () => {
  const [code, setCode] = useState<number[]>([]);
  const router = useRouter();
  const codeLength = Array(CODE_FIELDS).fill(null);
  const offset = useSharedValue(0);
  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const onNumberPress = (number: number) => {
    if (code.length < CODE_FIELDS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCode((prev) => [...prev, number]);
    }
  };
  const onBackSpacePress = () => {
    if (code.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCode(code.slice(0, -1));
    }
  };
  const onBiometricPress = async()=>{
    const result = await LocalAuthentication.authenticateAsync()
  }
  console.log("code", code);

  useEffect(() => {
    if (code.length === CODE_FIELDS) {
      if (code.join("") === "1234") {
        router.replace("/");
      } else {
        offset.value = withSequence(
          withTiming(-OFFSET, { duration: TIME / 20 }),
          withRepeat(withTiming(OFFSET, { duration: TIME / 2 }), 4, true),
          withTiming(0, { duration: TIME / 2 }),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setCode([]);
      }
    }
  }, [code, offset, router]);

  return (
    <SafeAreaView>
      <Text style={styles.greeting}>Welcome back, Akeem</Text>
      <Animated.View style={[styles.codeView, style]}>
        {codeLength.map((_, index) => (
          <View
            key={index}
            style={[
              styles.codeEmpty,
              {
                backgroundColor:
                  index < code.length ? COLORS.primary_400 : "transparent",
              },
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.numbersView}>
        {[0, 1, 2].map((rowIndex) => {
          const base = rowIndex * 3 + 1;
          return (
            <View
              key={rowIndex}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {[base, base + 1, base + 2].map((number) => (
                <TouchableOpacity
                  key={number}
                  style={[styles.keypadBtn, styles.numberBtn]}
                  onPress={() => onNumberPress(number)}
                >
                  <Text style={styles.number}>{number}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity style={[styles.keypadBtn]} onPress={() => {}}>
            <MaterialCommunityIcons
              name="face-recognition"
              size={30}
              color="#000"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onNumberPress(0)}
            style={[styles.keypadBtn, styles.numberBtn]}
          >
            <Text style={styles.number}>0</Text>
          </TouchableOpacity>
          <View style={styles.keypadBtn}>
            {code.length > 0 && (
              <TouchableOpacity
                style={[styles.keypadBtn]}
                onPress={onBackSpacePress}
              >
                <MaterialCommunityIcons
                  name="backspace"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 80,
    alignSelf: "center",
  },
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginVertical: 85,
  },
  codeEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary_400,
  },
  numbersView: {
    marginHorizontal: 60,
    gap: 50,
  },
  number: {
    fontSize: 32,
  },
  keypadBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  numberBtn: {
    backgroundColor: COLORS.primary_100,
  },
});
export default LockScreen;
