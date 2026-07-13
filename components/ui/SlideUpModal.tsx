import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  DimensionValue,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

type SlideUpModalProps = {
  title?: string;
  onClose?: () => void;
  children: ReactNode;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  closeIconColor?: string;
  height?: DimensionValue | undefined;
  className?: string;
  snapPoints?: (string | number)[];
  /** v5 defaults this to true, which lets tall content grow the sheet past
   * its snap points. Pass false to make snapPoints authoritative. */
  enableDynamicSizing?: boolean;
};

export type SlideUpModalRef = {
  present: () => void;
  dismiss: () => void;
  isOpen: () => boolean | undefined;
};

const SlideUpModal = forwardRef<SlideUpModalRef, SlideUpModalProps>(
  (
    {
      title,
      onClose,
      children,
      headerBackgroundColor = COLORS.primary_400,
      headerTextColor = "#222",
      closeIconColor,
      height,
      className,
      snapPoints: customSnapPoints,
      enableDynamicSizing = true,
    },
    ref,
  ) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const animatedIndex = useSharedValue(-1);
    const isOpen = useDerivedValue(() => animatedIndex.value >= 0);

    const snapPoints = useMemo(() => {
      if (customSnapPoints) return customSnapPoints;
      if (height) {
        if (typeof height === "number") return [height];
        if (typeof height === "string" && height.includes("%")) {
          return [height];
        }
      }
      return ["50%"];
    }, [customSnapPoints, height]);

    const handleDismiss = useCallback(() => {
      onClose?.();
    }, [onClose]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      [],
    );

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetModalRef.current?.present(),
      dismiss: () => bottomSheetModalRef.current?.dismiss(),
      isOpen: () => isOpen.value,
    }));

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        onDismiss={handleDismiss}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        animatedIndex={animatedIndex}
        backgroundStyle={styles.modal}
        handleComponent={null}
      >
        <BottomSheetView>
          {title && (
            <View
              style={[
                styles.header,
                { backgroundColor: headerBackgroundColor },
              ]}
            >
              <Text style={[styles.title, { color: headerTextColor }]}>
                {title}
              </Text>
              <TouchableOpacity
                onPress={() => bottomSheetModalRef.current?.dismiss()}
                hitSlop={20}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={closeIconColor ?? headerTextColor}
                />
              </TouchableOpacity>
            </View>
          )}

          <View className={cn("px-6 py-4", className)}>{children}</View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

SlideUpModal.displayName = "SlideUpModal";

export default SlideUpModal;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 14,
    fontFamily: "NunitoMedium",
  },
});
