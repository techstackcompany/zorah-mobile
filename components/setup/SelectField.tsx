import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

type SelectOption = {
  label: string;
  value: string;
  description?: string;
};

type SelectFieldProps = {
  label: string;
  placeholder?: string;
  value?: string | string[];
  options: SelectOption[];
  onSelect: any;
  className?: string;
  multiple?: boolean;
};

const SelectField = ({
  label,
  placeholder = "Select",
  value,
  options,
  onSelect,
  className,
  multiple = false,
}: SelectFieldProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectButtonRef = React.useRef<View>(null);
  const [triggerLayout, setTriggerLayout] = React.useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  let displayLabel = placeholder;
  let isAnySelected = false;

  if (multiple && Array.isArray(value)) {
    isAnySelected = value.length > 0;
    if (isAnySelected) {
      displayLabel = value
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean)
        .join(", ");
    }
  } else {
    const selectedOption = options.find((option) => option.value === value);
    isAnySelected = !!selectedOption;
    if (selectedOption) {
      displayLabel = selectedOption.label;
    }
  }

  const handleOpen = React.useCallback(() => {
    if (selectButtonRef.current) {
      selectButtonRef.current.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height });
        setIsOpen(true);
      });
    } else {
      setTriggerLayout(null);
      setIsOpen(true);
    }
  }, []);
  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <View className={cn("mt-6", className)}>
      <Text className="text-xs font-nunitoSemibold uppercase text-textColor/60">
        {label}
      </Text>
      <Pressable
        ref={selectButtonRef}
        onPress={handleOpen}
        className="mt-2 flex-row items-center justify-between rounded-xl border border-grayLight bg-white px-4 py-4"
      >
        <Text
          className={cn(
            "text-base",
            isAnySelected ? "text-textColor" : "text-textColor/40",
          )}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#2A3A50"
        />
      </Pressable>

      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={handleClose} />

          {triggerLayout ? (
            <View
              className="max-h-[60%] rounded-2xl bg-white px-5 py-5 shadow-lg"
              style={[
                styles.dropdown,
                {
                  top: triggerLayout.y + triggerLayout.height ,
                  left: triggerLayout.x,
                  width: triggerLayout.width,
                },
              ]}
            >
              <Text
                family="degular"
                weight="semibold"
                className="mb-4 text-lg text-textColor"
              >
                Select {label.toLowerCase()}
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {options.map((option) => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.includes(option.value)
                    : option.value === value;
                  return (
                    <Pressable
                      key={option.value}
                      className={cn(
                        "rounded-xl px-3 py-3",
                        isSelected ? "bg-primaryFaint" : "bg-transparent",
                      )}
                      onPress={() => {
                        if (multiple) {
                          const currentValues = Array.isArray(value) ? value : [];
                          if (currentValues.includes(option.value)) {
                            onSelect(currentValues.filter((v: string) => v !== option.value));
                          } else {
                            onSelect([...currentValues, option.value]);
                          }
                        } else {
                          onSelect(option.value);
                          handleClose();
                        }
                      }}
                    >
                      <Text className="text-base text-textColor">
                        {option.label}
                      </Text>
                      {option.description ? (
                        <Text className="mt-1 text-xs text-textColor/70">
                          {option.description}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdown: {
    position: "absolute",
  },
});

export default SelectField;
