import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface DeleteBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  budgetName?: string;
  isDeleting?: boolean;
}

const DeleteBudgetModal: React.FC<DeleteBudgetModalProps> = ({
  visible,
  onClose,
  onConfirm,
  budgetName,
  isDeleting = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={32} color="#EF4444" />
            </View>
            <Text weight="bold" className="mt-4 text-xl text-textColor">
              Delete {budgetName ? "Item" : "Budget"}?
            </Text>
            <Text className="mt-2 text-center text-sm text-textColor/70">
              {budgetName
                ? `Are you sure you want to delete "${budgetName}"? This action cannot be undone.`
                : "Are you sure you want to delete this budget? This action cannot be undone."}
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text weight="semibold" className="text-base text-textColor">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                isDeleting && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={isDeleting}
            >
              <Text weight="semibold" className="text-base text-white">
                {isDeleting ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.grayLight,
  },
  confirmButton: {
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default DeleteBudgetModal;
