import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import { setupInfo } from "@/constants";
import COLORS from "@/constants/colors";
import useKeyboardHeight from "@/hooks/useKeyboardHeight";
import useSetUpStep from "@/hooks/useSetUpStep";
import type { ApiError } from "@/src/api/client";
import {
  useGetUserProfileQuery,
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

const getKycPrefillFromUserData = (userData: unknown) => {
  const user = (userData ?? {}) as Record<string, unknown>;

  const fullName = [readString(user.firstName), readString(user.lastName)]
    .filter(Boolean)
    .join(" ");

  return {
    fullName: fullName,
    phoneNumber: digitsOnly(readString(user.phoneNumber)),
  };
};

const SubmitKycSetupScreen = () => {
  const { data: userData } = useGetUserProfileQuery();
  const { goToNextStep, goToPreviousStep } = useSetUpStep(3);
  const [fullName, setFullName] = useState("");
  const [dateOfBirthRaw, setDateOfBirthRaw] = useState<Date | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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

  const kycAlreadyCompleted = useMemo(() => {
    const root = (userData ?? {}) as Record<string, unknown>;
    const onboarding =
      root.onboarding && typeof root.onboarding === "object"
        ? (root.onboarding as Record<string, unknown>)
        : null;
    const stepsCompleted = Array.isArray(onboarding?.stepsCompleted)
      ? (onboarding.stepsCompleted as unknown[]).filter(
          (entry): entry is string => typeof entry === "string",
        )
      : [];
    return stepsCompleted.includes(setupInfo[3].key);
  }, [userData]);

  useEffect(() => {
    setFullName((prev) => prev || kycPrefill.fullName);
    setPhoneNumber((prev) => prev || kycPrefill.phoneNumber);
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
    if (submitKycMutation.isPending || updateOnboardingMutation.isPending) {
      return;
    }
    if (kycAlreadyCompleted && !isValid) {
      goToNextStep();
      return;
    }
    if (!isValid) {
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

    const unchanged =
      payload.fullName === kycPrefill.fullName &&
      payload.phoneNumber === kycPrefill.phoneNumber;

    if (kycAlreadyCompleted && unchanged) {
      goToNextStep();
      return;
    }

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
          <FullNameField
            fullName={fullName}
            setFullName={setFullName}
            handleFieldLayout={handleFieldLayout}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
          />

          <DateOfBirthField
            dateOfBirth={dateOfBirth}
            dateOfBirthRaw={dateOfBirthRaw}
            setDateOfBirthRaw={setDateOfBirthRaw}
            handleFieldLayout={handleFieldLayout}
            handleBlur={handleBlur}
            errors={errors}
            touched={touched}
          />

          <PhoneNumberField
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            handleFieldLayout={handleFieldLayout}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            scrollToField={scrollToField}
          />

          <StateField
            address={address}
            setAddress={setAddress}
            handleFieldLayout={handleFieldLayout}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
          />

          <BvnField
            bvn={bvn}
            setBvn={setBvn}
            handleFieldLayout={handleFieldLayout}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            scrollToField={scrollToField}
          />

          <NinField
            nin={nin}
            setNin={setNin}
            handleFieldLayout={handleFieldLayout}
            errors={errors}
            touched={touched}
            handleBlur={handleBlur}
            scrollToField={scrollToField}
          />
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
              (!isValid && !kycAlreadyCompleted) ||
              submitKycMutation.isPending ||
              updateOnboardingMutation.isPending
            }
          />
        </View>
      </View>
    </SetupContainer>
  );
};

interface FieldProps {
  handleFieldLayout: (key: string) => (event: LayoutChangeEvent) => void;
  handleBlur: (field: string) => void;
  scrollToField?: (key: string) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

const DateOfBirthField = ({
  dateOfBirth,
  dateOfBirthRaw,
  setDateOfBirthRaw,
  handleFieldLayout,
  handleBlur,
  errors,
  touched,
}: {
  dateOfBirth: string;
  setDateOfBirthRaw: (date: Date) => void;
  dateOfBirthRaw: Date | null;
} & FieldProps) => {
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const sheetRef = useRef<SlideUpModalRef>(null);
  const maxDate = getMaxDate();

  const handleOpen = () => {
    setPendingDate(dateOfBirthRaw ?? maxDate);
    sheetRef.current?.present();
  };

  const handleConfirm = () => {
    if (pendingDate) setDateOfBirthRaw(pendingDate);
    sheetRef.current?.dismiss();
    handleBlur("dateOfBirth");
  };

  const handleCancel = () => {
    handleBlur("dateOfBirth");
  };

  return (
    <View style={styles.field} onLayout={handleFieldLayout("dob")}>
      <Text className="text-sm text-textColor">Date Of Birth</Text>
      <Pressable onPress={handleOpen} style={styles.inputWithIcon}>
        <TextInput
          value={dateOfBirth}
          placeholder="YYYY-MM-DD"
          editable={false}
          pointerEvents="none"
          style={[
            styles.input,
            { paddingRight: 36 },
            touched.dateOfBirth && errors.dateOfBirth && styles.inputError,
          ]}
          placeholderTextColor="#9AA5B1"
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

      <SlideUpModal
        ref={sheetRef}
        title="Date of Birth"
        onClose={handleCancel}
        headerTextColor={COLORS.white}
        snapPoints={["45%"]}
      >
        <DateTimePicker
          value={pendingDate ?? maxDate}
          onChange={(_: DateTimePickerEvent, date?: Date) =>
            date && setPendingDate(date)
          }
          maximumDate={maxDate}
          display="spinner"
          accentColor={COLORS.primary_400}
          style={{ width: "100%" }}
        />
        <Button title="Confirm" onPress={handleConfirm} className="mt-3" />
      </SlideUpModal>
    </View>
  );
};

const FullNameField = ({
  fullName,
  setFullName,
  handleFieldLayout,
  errors,
  touched,
  handleBlur,
  scrollToField,
}: { fullName: string; setFullName: (text: string) => void } & FieldProps) => {
  return (
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
        onFocus={() => scrollToField?.("fullName")}
        onBlur={() => handleBlur("fullName")}
      />
      {touched.fullName && errors.fullName && (
        <Text className="text-xs text-red-500">{errors.fullName}</Text>
      )}
    </View>
  );
};

const PhoneNumberField = ({
  phoneNumber,
  setPhoneNumber,
  handleFieldLayout,
  errors,
  touched,
  handleBlur,
  scrollToField,
}: {
  phoneNumber: string;
  setPhoneNumber: (text: string) => void;
} & FieldProps) => {
  return (
    <View style={styles.field} onLayout={handleFieldLayout("phoneNumber")}>
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
        onFocus={() => scrollToField?.("phoneNumber")}
        onBlur={() => handleBlur("phoneNumber")}
      />
      {touched.phoneNumber && errors.phoneNumber && (
        <Text className="text-xs text-red-500">{errors.phoneNumber}</Text>
      )}
    </View>
  );
};

const StateField = ({
  address,
  setAddress,
  handleFieldLayout,
  errors,
  touched,
  handleBlur,
}: {
  address: string;
  setAddress: (value: string) => void;
} & FieldProps) => {
  const [showStateList, setShowStateList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput | null>(null);
  const { data: nigerianStates = [], isLoading: isLoadingStates } =
    useNigerianStatesApi();

  const filteredStates = useMemo(
    () =>
      searchQuery.trim()
        ? nigerianStates.filter((s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : nigerianStates,
    [nigerianStates, searchQuery],
  );

  const openList = () => {
    setShowStateList(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeList = () => {
    setShowStateList(false);
    setSearchQuery("");
    handleBlur("address");
  };

  return (
    <View style={styles.field} onLayout={handleFieldLayout("address")}>
      <Text className="text-sm text-textColor">State</Text>

      <Pressable
        style={[
          styles.input,
          styles.selectInput,
          touched.address && errors.address && styles.inputError,
        ]}
        accessibilityRole="button"
        onPress={() => (showStateList ? closeList() : openList())}
      >
        <Text className={address ? "text-textColor" : "text-[#9AA5B1]"}>
          {address || "Select your state"}
        </Text>

        {isLoadingStates ? (
          <ActivityIndicator size="small" color="#9AA5B1" />
        ) : (
          <Ionicons
            name={showStateList ? "chevron-up" : "chevron-down"}
            size={16}
            color="#9AA5B1"
          />
        )}
      </Pressable>

      {showStateList && nigerianStates.length > 0 ? (
        <View style={styles.selectList}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={16} color="#9AA5B1" />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search state..."
              placeholderTextColor="#9AA5B1"
              style={styles.searchInput}
              autoCorrect={false}
              onBlur={() => setTimeout(closeList, 150)}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color="#9AA5B1" />
              </Pressable>
            )}
          </View>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            style={styles.selectScroll}
          >
            {filteredStates.length > 0 ? (
              filteredStates.map((state) => (
                <Pressable
                  key={state.state_code}
                  style={[
                    styles.selectItem,
                    address === state.name && styles.selectItemActive,
                  ]}
                  onPress={() => {
                    setAddress(state.name);
                    closeList();
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
              ))
            ) : (
              <View style={styles.selectItem}>
                <Text className="text-sm text-[#9AA5B1]">No states found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : null}

      {touched.address && errors.address && (
        <Text className="text-xs text-red-500">{errors.address}</Text>
      )}
    </View>
  );
};

const BvnField = ({
  bvn,
  setBvn,
  handleFieldLayout,
  errors,
  touched,
  handleBlur,
  scrollToField,
}: {
  bvn: string;
  setBvn: (text: string) => void;
} & FieldProps) => {
  return (
    <View style={styles.field} onLayout={handleFieldLayout("bvn")}>
      <Text className="text-sm text-textColor">BVN</Text>

      <TextInput
        value={bvn}
        onChangeText={setBvn}
        keyboardType="number-pad"
        placeholder="Enter your 11-digit BVN"
        style={[styles.input, touched.bvn && errors.bvn && styles.inputError]}
        placeholderTextColor="#9AA5B1"
        maxLength={11}
        onFocus={() => scrollToField?.("bvn")}
        onBlur={() => handleBlur("bvn")}
      />

      {touched.bvn && errors.bvn && (
        <Text className="text-xs text-red-500">{errors.bvn}</Text>
      )}
    </View>
  );
};

const NinField = ({
  nin,
  setNin,
  handleFieldLayout,
  errors,
  touched,
  handleBlur,
  scrollToField,
}: {
  nin: string;
  setNin: (text: string) => void;
} & FieldProps) => {
  return (
    <View style={styles.field} onLayout={handleFieldLayout("nin")}>
      <Text className="text-sm text-textColor">NIN</Text>

      <TextInput
        value={nin}
        onChangeText={setNin}
        keyboardType="number-pad"
        placeholder="Enter your 11-digit NIN"
        style={[styles.input, touched.nin && errors.nin && styles.inputError]}
        placeholderTextColor="#9AA5B1"
        maxLength={11}
        onFocus={() => scrollToField?.("nin")}
        onBlur={() => handleBlur("nin")}
      />

      {touched.nin && errors.nin && (
        <Text className="text-xs text-red-500">{errors.nin}</Text>
      )}
    </View>
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E7EF",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textColor,
    paddingVertical: 0,
  },
  selectScroll: {
    maxHeight: 160,
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
