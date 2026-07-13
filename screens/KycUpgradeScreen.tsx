import DatePickerField from "@/components/ui/DatePickerField";
import MainContainer from "@/components/layouts/MainContainer";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Text from "@/components/ui/Text";
import TextInputField from "@/components/ui/TextInputField";
import COLORS from "@/constants/colors";
import type { ApiError } from "@/src/api/client";
import {
  useGetUserProfileQuery,
  useSubmitKycMutation,
  useWalletOverViewQuery,
} from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

const TIER = 2;

const readString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const digitsOnly = (value: string): string => value.replace(/\D/g, "");

const getPrefill = (userData: unknown) => {
  const user = (userData ?? {}) as Record<string, unknown>;
  const fullName = [readString(user.firstName), readString(user.lastName)]
    .filter(Boolean)
    .join(" ");
  return {
    fullName,
    phoneNumber: digitsOnly(readString(user.phoneNumber)),
  };
};

const KycUpgradeScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: userData } = useGetUserProfileQuery();
  const { data: overview } = useWalletOverViewQuery();
  const submitKycMutation = useSubmitKycMutation();

  const prefill = useMemo(() => getPrefill(userData), [userData]);

  const [fullName, setFullName] = useState("");
  const [dateOfBirthDisplay, setDateOfBirthDisplay] = useState("");
  const [dateOfBirthRaw, setDateOfBirthRaw] = useState<Date | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFullName((prev) => prev || prefill.fullName);
    setPhoneNumber((prev) => prev || prefill.phoneNumber);
  }, [prefill]);

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
      errs.dateOfBirth = "Select your date of birth";
    }
    if (!/^\d{10,15}$/.test(phoneNumber.trim())) {
      errs.phoneNumber = "Enter a valid phone number (10-15 digits)";
    }
    if (address.trim().length < 3) {
      errs.address = "Enter your address";
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

  const isApiError = (error: unknown): error is ApiError =>
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string";

  const handleSubmit = async () => {
    setTouched({
      fullName: true,
      dateOfBirth: true,
      phoneNumber: true,
      address: true,
      bvn: true,
      nin: true,
    });
    if (!isValid || submitKycMutation.isPending) {
      return;
    }

    // Matches the backend's documented multipart/form-data contract for
    // POST /kyc/submit.
    const formData = new FormData();
    formData.append("tier", String(TIER));
    formData.append("fullName", fullName.trim());
    formData.append("dateOfBirth", dateOfBirth.trim());
    formData.append("phoneNumber", phoneNumber.trim());
    formData.append("address", address.trim());
    formData.append("bvn", bvn.trim());
    formData.append("nin", nin.trim());

    try {
      await submitKycMutation.mutateAsync(formData);
      await queryClient.invalidateQueries({ queryKey: ["wallet", "overview"] });
      Toast.show({
        type: "success",
        text1: "Tier 2 upgrade submitted",
        text2: "We are reviewing your details.",
      });
      router.back();
    } catch (err) {
      const message = isApiError(err)
        ? err.message
        : "Unable to submit KYC upgrade. Please try again.";
      Toast.show({
        type: "error",
        text1: "Submission failed",
        text2: message,
      });
    }
  };

  const currentTier = overview?.kyc.currentTier ?? 1;
  const alreadyTier2 = currentTier >= TIER;

  return (
    <MainContainer edges={["bottom"]} className="bg-light pb-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 24,
          gap: 16,
        }}
      >
        <Text className="text-sm text-textColor/70">
          Upgrading to Tier 2 raises your transaction and wallet limits.
          Provide your BVN and NIN to complete verification.
        </Text>

        {alreadyTier2 ? (
          <View className="flex-row items-center gap-2 rounded-2xl bg-secondary_100 px-4 py-3">
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={COLORS.secondary_500}
            />
            <Text className="flex-1 text-sm text-secondary_500">
              You&apos;re already verified to Tier {currentTier}.
            </Text>
          </View>
        ) : null}

        <TextInputField
          label="Full Name"
          placeholder="John Doe"
          placeholderTextColor={COLORS.textColor + "80"}
          autoCapitalize="words"
          value={fullName}
          onChangeText={setFullName}
          onFocusChange={(focused) => !focused && handleBlur("fullName")}
          error={touched.fullName ? errors.fullName : undefined}
        />

        <View>
          <Text className="text-sm text-textColor/70">Date Of Birth</Text>
          <DatePickerField
            value={dateOfBirthDisplay}
            onChange={(formatted, raw) => {
              setDateOfBirthDisplay(formatted);
              setDateOfBirthRaw(raw);
              handleBlur("dateOfBirth");
            }}
          />
          {touched.dateOfBirth && errors.dateOfBirth ? (
            <Text className="mt-1 text-sm text-red-500">
              {errors.dateOfBirth}
            </Text>
          ) : null}
        </View>

        <TextInputField
          label="Phone Number"
          placeholder="0912345678"
          placeholderTextColor={COLORS.textColor + "80"}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          onFocusChange={(focused) => !focused && handleBlur("phoneNumber")}
          error={touched.phoneNumber ? errors.phoneNumber : undefined}
        />

        <TextInputField
          label="Address"
          placeholder="Lagos"
          placeholderTextColor={COLORS.textColor + "80"}
          value={address}
          onChangeText={setAddress}
          onFocusChange={(focused) => !focused && handleBlur("address")}
          error={touched.address ? errors.address : undefined}
        />

        <TextInputField
          label="BVN"
          placeholder="Enter your 11-digit BVN"
          placeholderTextColor={COLORS.textColor + "80"}
          keyboardType="number-pad"
          maxLength={11}
          value={bvn}
          onChangeText={setBvn}
          onFocusChange={(focused) => !focused && handleBlur("bvn")}
          error={touched.bvn ? errors.bvn : undefined}
        />

        <TextInputField
          label="NIN"
          placeholder="Enter your 11-digit NIN"
          placeholderTextColor={COLORS.textColor + "80"}
          keyboardType="number-pad"
          maxLength={11}
          value={nin}
          onChangeText={setNin}
          onFocusChange={(focused) => !focused && handleBlur("nin")}
          error={touched.nin ? errors.nin : undefined}
        />
      </ScrollView>

      <View className="px-6 pb-6 pt-2">
        <PrimaryButton
          label={alreadyTier2 ? "Resubmit for Tier 2" : "Submit"}
          loading={submitKycMutation.isPending}
          loadingLabel="Submitting..."
          onPress={handleSubmit}
        />
      </View>
    </MainContainer>
  );
};

export default KycUpgradeScreen;
