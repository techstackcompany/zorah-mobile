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
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
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

const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 16);
    return today;
  };
const SubmitKycSetupScreen = () => {
  const router = useRouter();
  const { setSetupStep } = useSession();
  const [tier, setTier] = useState<number>(1);
  const [fullName, setFullName] = useState("");
  const [dateOfBirthRaw, setDateOfBirthRaw] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [showTierList, setShowTierList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const dateOfBirth =
    dateOfBirthRaw instanceof Date ? format(dateOfBirthRaw, "yyyy-MM-dd") : "";

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (fullName.trim().length < 3) {
      errs.fullName = "Full name must be at least 3 characters";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      errs.dateOfBirth = "Enter date in YYYY-MM-DD format";
    }
    if (!/^\d{10,15}$/.test(phoneNumber.trim())) {
      errs.phoneNumber = "Enter a valid phone number (10-15 digits)";
    }
    if (address.trim().length < 3) {
      errs.address = "Please select your state";
    }
    if (!/^\d{11}$/.test(bvn.trim())) {
      errs.bvn = "BVN must be 11 digits";
    }
    if (!/^\d{11}$/.test(nin.trim())) {
      errs.nin = "NIN must be 11 digits";
    }
    return errs;
  }, [fullName, dateOfBirth, phoneNumber, address, bvn, nin]);

  const isValid = Object.keys(errors).length === 0;

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

  const handleDateChange = (
    event: DateTimePickerEvent,
    date: Date | undefined,
  ) => {
    setShowDatePicker(false);
    if (event.type === "set" && date) {
      setDateOfBirthRaw(date);
    }
  };


  const maxDate = getMaxDate();

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
              style={[
                styles.input,
                touched.fullName && errors.fullName && styles.inputError,
              ]}
              placeholderTextColor="#9AA5B1"
              autoCapitalize="words"
              onFocus={() => scrollToField("fullName")}
              onBlur={() => handleBlur("fullName")}
            />
            {touched.fullName && errors.fullName && (
              <Text className="text-xs text-red-500">{errors.fullName}</Text>
            )}
          </View>

          <View style={styles.field} onLayout={handleFieldLayout("dob")}>
            <Text className="text-sm text-textColor">Date Of Birth</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={styles.inputWithIcon}
            >
              <TextInput
                value={dateOfBirth}
                keyboardType="numbers-and-punctuation"
                placeholder="YYYY-MM-DD"
                editable={false}
                pointerEvents="none"
                style={[
                  styles.input,
                  { paddingRight: 36 },
                  touched.dateOfBirth &&
                    errors.dateOfBirth &&
                    styles.inputError,
                ]}
                placeholderTextColor="#9AA5B1"
                onBlur={() => handleBlur("dateOfBirth")}
              />
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#9AA5B1"
                style={styles.inputIcon}
              />
            </Pressable>
            {touched.dateOfBirth && errors.dateOfBirth && (
              <Text className="text-xs text-red-500">{errors.dateOfBirth}</Text>
            )}
            {showDatePicker  && (
              <DateTimePicker
                accentColor={COLORS.primary_400}
                value={dateOfBirthRaw || maxDate}
                onChange={handleDateChange}
                maximumDate={maxDate}
                positiveButton={{ label: "OK", textColor: COLORS.primary_400 }}
                negativeButton={{
                  label: "Cancel",
                  textColor: COLORS.primary_400,
                }}
              />
            )}
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
              style={[
                styles.input,
                touched.phoneNumber && errors.phoneNumber && styles.inputError,
              ]}
              placeholderTextColor="#9AA5B1"
              onFocus={() => scrollToField("phoneNumber")}
              onBlur={() => handleBlur("phoneNumber")}
            />
            {touched.phoneNumber && errors.phoneNumber && (
              <Text className="text-xs text-red-500">{errors.phoneNumber}</Text>
            )}
          </View>

          <View style={styles.field} onLayout={handleFieldLayout("address")}>
            <Text className="text-sm text-textColor">State</Text>
            <Pressable
              style={[
                styles.input,
                styles.selectInput,
                touched.address && errors.address && styles.inputError,
              ]}
              accessibilityRole="button"
              onPress={() => {
                setShowStateList((s) => !s);
                setShowTierList(false);
                handleBlur("address");
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
            {touched.address && errors.address && (
              <Text className="text-xs text-red-500">{errors.address}</Text>
            )}
          </View>

          <View style={styles.field} onLayout={handleFieldLayout("bvn")}>
            <Text className="text-sm text-textColor">BVN</Text>
            <TextInput
              value={bvn}
              onChangeText={setBvn}
              keyboardType="number-pad"
              placeholder="22624259105"
              style={[
                styles.input,
                touched.bvn && errors.bvn && styles.inputError,
              ]}
              placeholderTextColor="#9AA5B1"
              maxLength={11}
              onFocus={() => scrollToField("bvn")}
              onBlur={() => handleBlur("bvn")}
            />
            {touched.bvn && errors.bvn && (
              <Text className="text-xs text-red-500">{errors.bvn}</Text>
            )}
          </View>

          <View style={styles.field} onLayout={handleFieldLayout("nin")}>
            <Text className="text-sm text-textColor">NIN</Text>
            <TextInput
              value={nin}
              onChangeText={setNin}
              keyboardType="number-pad"
              placeholder="38074528687"
              style={[
                styles.input,
                touched.nin && errors.nin && styles.inputError,
              ]}
              placeholderTextColor="#9AA5B1"
              maxLength={11}
              onFocus={() => scrollToField("nin")}
              onBlur={() => handleBlur("nin")}
            />
            {touched.nin && errors.nin && (
              <Text className="text-xs text-red-500">{errors.nin}</Text>
            )}
          </View>
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            title={submitKycMutation.isPending ? "Submitting..." : "Next"}
            onPress={handleNext}
            disabled={!isValid || submitKycMutation.isPending}
          />
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
  inputError: {
    borderColor: "#EF4444",
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
