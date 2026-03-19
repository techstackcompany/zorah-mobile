import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "./Text";
import Button from "./Button";
import COLORS from "@/constants/colors";

type FeatureGateModalProps = {
  visible: boolean;
  featureName: string;
  onCompleteSetup: () => void;
  onGoBack: () => void;
};

const FeatureGateModal = ({
  visible,
  featureName,
  onCompleteSetup,
  onGoBack,
}: FeatureGateModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color={COLORS.primary_400} />
          </View>
          <Text weight="bold" style={styles.title}>
            {featureName} Limit Reached
          </Text>
          <Text style={styles.description}>
            You have reached the  limit for this feature. Please complete your profile setup to unlock unlimited access.
          </Text>

          <View style={styles.actions}>
            <Button title="Complete Setup" onPress={onCompleteSetup} />
            <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
              <Text weight="semibold" style={styles.backText}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary_100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: COLORS.textColor,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  backText: {
    color: "#6B7280",
    fontSize: 16,
  },
});

export default FeatureGateModal;
