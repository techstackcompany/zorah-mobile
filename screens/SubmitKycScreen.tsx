import React, { useMemo, useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const NATIONALITIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Other"];

const SubmitKycScreen = () => {
  const [bvn, setBvn] = useState("");
  const [nationality, setNationality] = useState<string>(NATIONALITIES[0]);
  const [dob, setDob] = useState(""); // dd/mm/yyyy
  const [address, setAddress] = useState("");
  const [showNationalityList, setShowNationalityList] = useState(false);

  const isValid = useMemo(() => {
    const bvnValid = /^\d{11}$/.test(bvn.trim());
    const dobValid = /^\d{2}\/\d{2}\/\d{4}$/.test(dob.trim());
    const addressValid = address.trim().length > 3;
    return bvnValid && dobValid && addressValid && nationality.length > 0;
  }, [bvn, dob, address, nationality]);

  const handleSubmit = () => {
    if (!isValid) return;
    // TODO: integrate API submission
    router.back();
  };

  return (
    <MainContainer edges={["top"]} className="bg-white">
      <View style={styles.headerRow}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.textColor} />
        </Pressable>
        <Text weight="semibold" className="text-base text-textColor">
          Submit KYC
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <Text weight="semibold" className="text-lg text-textColor">
          Personal Details
        </Text>

        {/* BVN */}
        <View style={styles.field}>
          <Text className="text-sm text-textColor">BVN</Text>
          <TextInput
            value={bvn}
            onChangeText={setBvn}
            keyboardType="number-pad"
            placeholder="12345678901"
            style={styles.input}
            placeholderTextColor="#9AA5B1"
          />
        </View>

        {/* Nationality */}
        <View style={styles.field}>
          <Text className="text-sm text-textColor">Nationality</Text>
          <Pressable
            style={[styles.input, styles.selectInput]}
            accessibilityRole="button"
            onPress={() => setShowNationalityList((s) => !s)}
          >
            <Text className="text-textColor">{nationality}</Text>
            <Ionicons name="chevron-down" size={16} color="#9AA5B1" />
          </Pressable>
          {showNationalityList ? (
            <View style={styles.selectList}>
              {NATIONALITIES.map((item) => (
                <Pressable
                  key={item}
                  style={styles.selectItem}
                  onPress={() => {
                    setNationality(item);
                    setShowNationalityList(false);
                  }}
                >
                  <Text className="text-sm text-textColor">{item}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {/* Date Of Birth */}
        <View style={styles.field}>
          <Text className="text-sm text-textColor">Date Of Birth</Text>
          <View style={styles.inputWithIcon}>
            <TextInput
              value={dob}
              onChangeText={setDob}
              keyboardType="numbers-and-punctuation"
              placeholder="10/04/1987"
              style={[styles.input, { paddingRight: 36 }]}
              placeholderTextColor="#9AA5B1"
            />
            <Ionicons name="calendar-outline" size={18} color="#9AA5B1" style={styles.inputIcon} />
          </View>
        </View>

        {/* Address */}
        <View style={styles.field}>
          <Text className="text-sm text-textColor">Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            style={styles.input}
            placeholderTextColor="#9AA5B1"
          />
        </View>

        {/* No progress UI, No upload proof section */}

        <Pressable
          style={[styles.submitBtn, { opacity: isValid ? 1 : 0.5 }]}
          disabled={!isValid}
          onPress={handleSubmit}
          accessibilityRole="button"
        >
          <Text weight="semibold" className="text-white">
            Next
          </Text>
        </Pressable>
      </View>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backBtn: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
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
  },
  selectItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary_400,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
});

export default SubmitKycScreen;
