import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { setupInfo } from "@/constants";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import useKeyboardHeight from "@/hooks/useKeyboardHeight";
import useSetUpStep from "@/hooks/useSetUpStep";
import type { ApiError } from "@/src/api/client";
import {
  useSubmitKycMutation,
  useUpdateOnboardingMutation,
} from "@/src/api/hooks";
import { useNigerianStatesApi } from "@/src/api/hooks/useCountriesApi";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const DEFAULT_TIER = 1;
const getMaxDate = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 16);
  return today;
};

const readString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const digitsOnly = (value: string): string => value.replace(/\D/g, "");

const normalizeDateToIso = (value: string): string => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return format(parsed, "yyyy-MM-dd");
};

const getRecord = (
  source: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null => {
  const value = source[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const getKycPrefillFromUserData = (userData: unknown) => {
  const root = (userData ?? {}) as Record<string, unknown>;
  const nested = [
    getRecord(root, "kyc"),
    getRecord(root, "kycData"),
    getRecord(root, "kycInfo"),
    getRecord(root, "kycDetails"),
    getRecord(root, "walletKyc"),
    getRecord(root, "wallet"),
  ].filter((item): item is Record<string, unknown> => Boolean(item));

  const sources = [root, ...nested];

  const pick = (keys: string[]): string => {
    for (const source of sources) {
      for (const key of keys) {
        const value = readString(source[key]);
        if (value) {
          return value;
        }
      }
    }
    return "";
  };

  const fallbackFullName = [
    readString(root.firstName),
    readString(root.lastName),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    fullName: pick(["fullName", "name"]) || fallbackFullName,
    dateOfBirth: normalizeDateToIso(
      pick(["dateOfBirth", "dob", "birthDate", "birthday"]),
    ),
    phoneNumber: digitsOnly(
      pick(["phoneNumber", "phone", "mobile", "mobileNumber"]),
    ),
    address: pick(["address", "state", "residentialAddress"]),
    bvn: digitsOnly(pick(["bvn", "BVN"])),
    nin: digitsOnly(pick(["nin", "NIN"])),
  };
};

const SubmitKycSetupScreen = () => {
  const { userData } = useSession();
  const { goToNextStep, goToPreviousStep } = useSetUpStep(3);
  const [fullName, setFullName] = useState("");
  const [dateOfBirthRaw, setDateOfBirthRaw] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [showStateList, setShowStateList] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { data: nigerianStates = [], isLoading: isLoadingStates } =
    useNigerianStatesApi();
  const scrollRef = useRef<ScrollView | null>(null);
  const fieldPositions = useRef<Record<string, number>>({});
  const updateOnboardingMutation = useUpdateOnboardingMutation({
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });
  const submitKycMutation = useSubmitKycMutation();

  const kycPrefill = useMemo(
    () => getKycPrefillFromUserData(userData),
    [userData],
  );

  useEffect(() => {
    setFullName((prev) => prev || kycPrefill.fullName);
    setPhoneNumber((prev) => prev || kycPrefill.phoneNumber);
    setAddress((prev) => prev || kycPrefill.address);
    setBvn((prev) => prev || kycPrefill.bvn);
    setNin((prev) => prev || kycPrefill.nin);

    if (!dateOfBirthRaw && kycPrefill.dateOfBirth) {
      const parsed = new Date(kycPrefill.dateOfBirth);
      if (!Number.isNaN(parsed.getTime())) {
        setDateOfBirthRaw(parsed);
      }
    }
  }, [dateOfBirthRaw, kycPrefill]);

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

  const persistOnboardingStep = async () => {
    await updateOnboardingMutation.mutateAsync({
      data: {},
      step: setupInfo[3].key,
    });
  };

  const showSuccessAndAdvance = () => {
    Toast.show({
      type: "success",
      text1: "Wallet creation initiated",
      text2: "We are reviewing your details.",
    });

    goToNextStep();
  };

  const isApiError = (error: unknown): error is ApiError => {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    );
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

  const handleNext = async () => {
    if (
      !isValid ||
      submitKycMutation.isPending ||
      updateOnboardingMutation.isPending
    ) {
      return;
    }

    const payload = {
      tier: DEFAULT_TIER,
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      bvn: bvn.trim(),
      nin: nin.trim(),
    };
    try {
      await submitKycMutation.mutateAsync(payload);
      await persistOnboardingStep();
      showSuccessAndAdvance();
    } catch (err) {
      const message = isApiError(err)
        ? err.message
        : "Unable to submit KYC. Please try again.";

      if (message === "Wallet already created for this user") {
        try {
          await persistOnboardingStep();
          showSuccessAndAdvance();
        } catch (updateErr) {
          const updateMessage =
            updateErr instanceof Error
              ? updateErr.message
              : "Wallet exists, but onboarding step update failed.";

          Toast.show({
            type: "error",
            text1: "Could not complete setup",
            text2: updateMessage,
          });
        }

        return;
      }

      Toast.show({
        type: "error",
        text1: "Submission failed",
        text2: message,
      });
    }
  };

  const handlePrevious = () => {
    goToPreviousStep();
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
          currentStep={3}
          totalSteps={4}
          title="Wallet Creation"
          description="Please provide your KYC information to create your wallet"
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
            {showDatePicker && (
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

        <View className="flex-row gap-2 px-6 pt-4">
          <Button
            title="Previous"
            variant="outline"
            className="flex-1"
            onPress={handlePrevious}
            disabled={submitKycMutation.isPending}
          />
          <Button
            title={submitKycMutation.isPending ? "Submitting..." : "Next"}
            onPress={handleNext}
            className="flex-1"
            disabled={
              !isValid ||
              submitKycMutation.isPending ||
              updateOnboardingMutation.isPending
            }
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
