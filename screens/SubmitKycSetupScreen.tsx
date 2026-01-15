import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import useKeyboardHeight from "@/hooks/useKeyboardHeight";
import useSetUpStep from "@/hooks/useSetUpStep";
import { useSubmitKycMutation } from "@/src/api/hooks";
import { useNigerianStatesApi } from "@/src/api/hooks/useCountriesApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const KYC_TIERS = [{ value: 1, label: "Tier 1" }];

const SubmitKycSetupScreen = () => {
  const router = useRouter();
  const { setSetupStep } = useSession();
  const [tier, setTier] = useState<number>(1);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [showTierList, setShowTierList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const { data: nigerianStates = [], isLoading: isLoadingStates } =
    useNigerianStatesApi();

  const scrollRef = useRef<ScrollView | null>(null);
  const fieldPositions = useRef<Record<string, number>>({});

  useSetUpStep(1);

  const submitKycMutation = useSubmitKycMutation({
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "KYC submitted",
        text2: "We are reviewing your details.",
      });
      setSetupStep(2);
      router.push("/(auth)/setup/monthly-income");
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Submission failed",
        text2: error.message || "Unable to submit KYC. Please try again.",
      });
    },
  });

  const { keyboardHeight } = useKeyboardHeight();

  const handleFieldLayout =
    (key: string) =>
    (event: LayoutChangeEvent): void => {
      fieldPositions.current[key] = event.nativeEvent.layout.y;
    };

  const scrollToField = (key: string) => {
    const y = fieldPositions.current[key];
    if (typeof y === "number") {
      scrollRef.current?.scrollTo({
        y: Math.max(0, y - 12),
        animated: true,
      });
    }
  };

  const isValid = useMemo(() => {
    const fullNameValid = fullName.trim().length >= 3;
    const dateOfBirthValid = /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim());
    const phoneNumberValid = /^\d{10,15}$/.test(phoneNumber.trim());
    const addressValid = address.trim().length > 3;
    const bvnValid = /^\d{11}$/.test(bvn.trim());
    const ninValid = /^\d{11}$/.test(nin.trim());
    return (
      fullNameValid &&
      dateOfBirthValid &&
      phoneNumberValid &&
      addressValid &&
      bvnValid &&
      ninValid
    );
  }, [fullName, dateOfBirth, phoneNumber, address, bvn, nin]);

  const handleNext = () => {
    if (!isValid || submitKycMutation.isPending) return;
    const payload = {
      tier,
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      bvn: bvn.trim(),
      nin: nin.trim(),
    };
    submitKycMutation.mutate(payload);
  };

  return (
    <SetupContainer>
      <View className="flex-1">
        <SetupHeader
          currentStep={1}
          totalSteps={4}
          title="Personal Details"
          description="Please provide your KYC information"
        />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            !!keyboardHeight && { paddingBottom: keyboardHeight + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-6"
        >
          <View style={styles.field} onLayout={handleFieldLayout("tier")}>
            <Text className="text-sm text-textColor">KYC Tier</Text>
            <Pressable
              style={[styles.input, styles.selectInput]}
              accessibilityRole="button"
              onPress={() => setShowTierList((s) => !s)}
            >
              <Text className="text-textColor">
                {KYC_TIERS.find((t) => t.value === tier)?.label}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#9AA5B1" />
            </Pressable>
            {showTierList ? (
              <View style={styles.selectList}>
                {KYC_TIERS.map((item) => (
                  <Pressable
                    key={item.value}
                    style={styles.selectItem}
                    onPress={() => {
                      setTier(item.value);
                      setShowTierList(false);
                    }}
                  >
                    <Text className="text-sm text-textColor">{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.field} onLayout={handleFieldLayout("fullName")}>
            <Text className="text-sm text-textColor">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              style={styles.input}
              placeholderTextColor="#9AA5B1"
              autoCapitalize="words"
              onFocus={() => scrollToField("fullName")}
            />
          </View>

          <View style={styles.field} onLayout={handleFieldLayout("dob")}>
            <Text className="text-sm text-textColor">Date Of Birth</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                keyboardType="numbers-and-punctuation"
                placeholder="1999-03-10"
                style={[styles.input, { paddingRight: 36 }]}
                placeholderTextColor="#9AA5B1"
                onFocus={() => scrollToField("dob")}
              />
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#9AA5B1"
                style={styles.inputIcon}
              />
            </View>
          </View>

          <View
            style={styles.field}
            onLayout={handleFieldLayout("phoneNumber")}
          >
            <Text className="text-sm text-textColor">Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="0912345678"
              style={styles.input}
              placeholderTextColor="#9AA5B1"
              onFocus={() => scrollToField("phoneNumber")}
            />
          </View>

          <View style={styles.field} onLayout={handleFieldLayout("address")}>
            <Text className="text-sm text-textColor">State</Text>
            <Pressable
              style={[styles.input, styles.selectInput]}
              accessibilityRole="button"
              onPress={() => {
                setShowStateList((s) => !s);
                setShowTierList(false);
              }}
            >
              <Text className={address ? "text-textColor" : "text-[#9AA5B1]"}>
                {address || "Select your state"}
              </Text>
              {isLoadingStates ? (
                <ActivityIndicator size="small" color="#9AA5B1" />
              ) : (
                <Ionicons name="chevron-down" size={16} color="#9AA5B1" />
              )}
            </Pressable>
            {showStateList && nigerianStates.length > 0 ? (
              <ScrollView
                style={styles.selectList}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {nigerianStates.map((state) => (
                  <Pressable
                    key={state.state_code}
                    style={[
                      styles.selectItem,
                      address === state.name && styles.selectItemActive,
                    ]}
                    onPress={() => {
                      setAddress(state.name);
                      setShowStateList(false);
                    }}
                  >
                    <Text
                      className={`text-sm ${
                        address === state.name
                          ? "text-primary_400"
                          : "text-textColor"
                      }`}
                    >
                      {state.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </View>

          <View style={styles.field} onLayout={handleFieldLayout("bvn")}>
            <Text className="text-sm text-textColor">BVN</Text>
            <TextInput
              value={bvn}
              onChangeText={setBvn}
              keyboardType="number-pad"
              placeholder="22624259105"
              style={styles.input}
              placeholderTextColor="#9AA5B1"
              maxLength={11}
              onFocus={() => scrollToField("bvn")}
            />
          </View>

          <View style={styles.field} onLayout={handleFieldLayout("nin")}>
            <Text className="text-sm text-textColor">NIN</Text>
            <TextInput
              value={nin}
              onChangeText={setNin}
              keyboardType="number-pad"
              placeholder="38074528687"
              style={styles.input}
              placeholderTextColor="#9AA5B1"
              maxLength={11}
              onFocus={() => scrollToField("nin")}
            />
          </View>
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            onPress={handleNext}
            disabled={!isValid || submitKycMutation.isPending}
          >
            {submitKycMutation.isPending ? "Submitting..." : "Next"}
          </Button>
        </View>
      </View>
    </SetupContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 20,
  },
  field: {
    gap: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textColor,
  },
  inputWithIcon: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectList: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    maxHeight: 200,
  },
  selectItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectItemActive: {
    backgroundColor: COLORS.primary_100,
  },
});

export default SubmitKycSetupScreen;
