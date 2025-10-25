import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type DatePickerFieldProps = {
  value: string;
  onChange: (formatted: string, raw: Date) => void;
  onFocusChange?: (focused: boolean) => void;
  isFocused?: boolean;
  placeholder?: string;
};

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

const formatDate = (value: Date) => {
  const day = value.getDate().toString().padStart(2, "0");
  const month = (value.getMonth() + 1).toString().padStart(2, "0");
  const year = value.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

const parseDateString = (value: string) => {
  if (!value) {
    return null;
  }

  const parts = value.split("/");
  if (parts.length !== 3) {
    return null;
  }

  const [dayStr, monthStr, yearStr] = parts;
  const day = Number(dayStr);
  const monthIndex = Number(monthStr) - 1;
  const fullYear =
    yearStr.length === 2 ? 2000 + Number(yearStr) : Number(yearStr);

  if (
    Number.isNaN(day) ||
    Number.isNaN(monthIndex) ||
    Number.isNaN(fullYear)
  ) {
    return null;
  }

  const parsed = new Date(fullYear, monthIndex, day);
  if (
    parsed.getFullYear() !== fullYear ||
    parsed.getMonth() !== monthIndex ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};


const DatePickerField = ({
  value,
  onChange,
  onFocusChange,
  isFocused = false,
  placeholder = "DD/MM/YY",
}: DatePickerFieldProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarCursor, setCalendarCursor] = useState(
    () => parseDateString(value) ?? new Date(),
  );
  const selectButtonRef = useRef<View>(null);
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const selectedDateValue = useMemo(
    () => parseDateString(value),
    [value],
  );

  const closeCalendar = useCallback(() => {
    if (!isCalendarOpen) {
      return;
    }
    setIsCalendarOpen(false);
    onFocusChange?.(false);
  }, [isCalendarOpen, onFocusChange]);

  const openCalendar = useCallback(() => {
    const baseDate = selectedDateValue ?? new Date();
    setCalendarCursor(baseDate);
    if (selectButtonRef.current) {
      selectButtonRef.current.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height });
        setIsCalendarOpen(true);
        onFocusChange?.(true);
      });
    } else {
      setTriggerLayout(null);
      setIsCalendarOpen(true);
      onFocusChange?.(true);
    }
  }, [selectedDateValue, onFocusChange]);

  const toggleCalendar = useCallback(() => {
    if (isCalendarOpen) {
      closeCalendar();
    } else {
      openCalendar();
    }
  }, [isCalendarOpen, closeCalendar, openCalendar]);

  const goToPreviousMonth = useCallback(() => {
    setCalendarCursor((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      return next;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCalendarCursor((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next;
    });
  }, []);

  const calendarDays = useMemo(() => {
    const month = calendarCursor.getMonth();
    const year = calendarCursor.getFullYear();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - firstDayIndex + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return { key: `empty-${index}`, label: "", date: null as Date | null };
      }
      const dateObject = new Date(year, month, dayNumber);
      return {
        key: dateObject.toISOString(),
        label: String(dayNumber),
        date: dateObject,
      };
    });
  }, [calendarCursor]);

  const monthLabel = useMemo(() => {
    const displayDate = new Date(
      calendarCursor.getFullYear(),
      calendarCursor.getMonth(),
      1,
    );
    const monthName = displayDate.toLocaleString("default", {
      month: "long",
    });
    return `${monthName} ${displayDate.getFullYear()}`;
  }, [calendarCursor]);

  const handleDateSelection = useCallback(
    (selected: Date) => {
      onChange(formatDate(selected), selected);
      setCalendarCursor(selected);
      closeCalendar();
    },
    [onChange, closeCalendar],
  );

  const today = new Date();
  const isActive = isFocused || isCalendarOpen;
  const calendarContent = (
    <>
      <View className="flex-row items-center justify-between">
        <Pressable onPress={goToPreviousMonth} hitSlop={8}>
          <Ionicons name="chevron-back" size={18} color={COLORS.textColor} />
        </Pressable>
        <Text weight="semibold" className="text-base text-textColor">
          {monthLabel}
        </Text>
        <Pressable onPress={goToNextMonth} hitSlop={8}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.textColor}
          />
        </Pressable>
      </View>

      <View className="mt-3 flex-row justify-between">
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} className="w-9 text-center text-xs text-textColor/50">
            {weekday}
          </Text>
        ))}
      </View>

      <View className="mt-2 flex-row flex-wrap">
        {calendarDays.map(({ key, label, date: cellDate }) => {
          if (!cellDate) {
            return (
              <View
                key={key}
                style={{ width: "14.2857%" }}
                className="mb-2 h-9 items-center justify-center"
              />
            );
          }

          const isSelected =
            selectedDateValue &&
            selectedDateValue.getFullYear() === cellDate.getFullYear() &&
            selectedDateValue.getMonth() === cellDate.getMonth() &&
            selectedDateValue.getDate() === cellDate.getDate();

          const isToday =
            today.getFullYear() === cellDate.getFullYear() &&
            today.getMonth() === cellDate.getMonth() &&
            today.getDate() === cellDate.getDate();

          return (
            <Pressable
              key={key}
              style={{ width: "14.2857%" }}
              className="mb-2 items-center"
              onPress={() => handleDateSelection(cellDate)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${formatDate(cellDate)}`}
            >
              <View
                className={cn(
                  "h-9 w-9 items-center justify-center rounded-full",
                  isSelected ? "bg-primary_400" : "bg-transparent",
                  isToday && !isSelected
                    ? "border border-primary_400"
                    : "border border-transparent",
                )}
              >
                <Text
                  weight="medium"
                  className={cn(
                    "text-sm",
                    isSelected ? "text-white" : "text-textColor",
                  )}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <>
      <Pressable
        ref={selectButtonRef}
        onPress={toggleCalendar}
        className={cn(
          "mt-2 flex-row items-center justify-between rounded-xl border bg-white px-4 py-4",
          isActive ? "border-primary_400" : "border-grayLight",
        )}
        accessibilityRole="button"
        accessibilityLabel="Select date"
      >
        <Text
          className={cn(
            "text-base",
            value ? "text-textColor" : "text-textColor/40",
          )}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name={isCalendarOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#2A3A50"
        />
      </Pressable>

      <Modal
        transparent
        visible={isCalendarOpen}
        animationType="fade"
        onRequestClose={closeCalendar}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={closeCalendar}
            accessibilityRole="button"
            accessibilityLabel="Dismiss calendar"
          />

          {triggerLayout ? (
            <View
              className="rounded-3xl border border-gray-200 bg-white p-4 shadow-lg"
              style={[
                styles.dropdown,
                {
                  top: triggerLayout.y + triggerLayout.height,
                  left: triggerLayout.x,
                  width: triggerLayout.width,
                },
              ]}
            >
              {calendarContent}
            </View>
          ) : (
            <View className="mx-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-lg">
              {calendarContent}
            </View>
          )}
        </View>
      </Modal>
    </>
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

export default DatePickerField;
