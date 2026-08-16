import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

type DatePickerFieldProps = {
  value: string;
  onChange: (formatted: string, raw: Date) => void;
  onFocusChange?: (focused: boolean) => void;
  isFocused?: boolean;
  placeholder?: string;
  renderSelectIcon?: (isCalendarOpen: boolean) => React.ReactNode;
};

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** How far back the year picker reaches — enough for any date of birth. */
const YEARS_BACK = 100;
const YEARS_FORWARD = 10;
const YEAR_ROW_HEIGHT = 44;
const YEAR_COLUMNS = 4;

/**
 * Resolve a two-digit year. Anything that would land more than YEARS_FORWARD
 * beyond today is treated as the previous century, so "95" reads as 1995
 * rather than 2095.
 */
const expandTwoDigitYear = (twoDigit: number) => {
  const candidate = 2000 + twoDigit;
  return candidate > new Date().getFullYear() + YEARS_FORWARD
    ? candidate - 100
    : candidate;
};

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
  // A two-digit year is ambiguous. Assuming 2000+ turned a 1995 date of birth
  // into 2095 on the round trip, so anything landing far in the future is read
  // as the previous century instead.
  const fullYear =
    yearStr.length === 2
      ? expandTwoDigitYear(Number(yearStr))
      : Number(yearStr);

  if (Number.isNaN(day) || Number.isNaN(monthIndex) || Number.isNaN(fullYear)) {
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
  renderSelectIcon,
}: DatePickerFieldProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // Stepping month-by-month to reach a date of birth took hundreds of taps, so
  // the header drills down: days -> years -> months -> days.
  const [view, setView] = useState<"days" | "months" | "years">("days");
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
  const [calendarSize, setCalendarSize] = useState<{
    height: number;
    width: number;
  } | null>(null);

  const selectedDateValue = useMemo(() => parseDateString(value), [value]);

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
    setView("days");
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

  const dropdownPositionStyle = useMemo(() => {
    if (!triggerLayout) {
      return null;
    }

    const windowHeight = Dimensions.get("window").height;
    const calendarHeight = calendarSize?.height ?? 0;
    const margin = 8;
    const spaceBelow =
      windowHeight - (triggerLayout.y + triggerLayout.height);
    const spaceAbove = triggerLayout.y;
    const left = triggerLayout.x;
    const width = triggerLayout.width;

    if (calendarHeight > 0) {
      const fitsBelow = spaceBelow >= calendarHeight + margin;
      const fitsAbove = spaceAbove >= calendarHeight + margin;

      if (fitsBelow || (!fitsAbove && spaceBelow >= spaceAbove)) {
        const safeTop = Math.min(
          windowHeight - calendarHeight - margin,
          triggerLayout.y + triggerLayout.height,
        );
        return {
          top: Math.max(margin, safeTop),
          left,
          width,
        };
      }

      const safeTop = Math.max(
        margin,
        triggerLayout.y - calendarHeight,
      );
      return {
        top: safeTop,
        left,
        width,
      };
    }

    const defaultTop = Math.min(
      windowHeight - margin,
      triggerLayout.y + triggerLayout.height,
    );
    return {
      top: Math.max(margin, defaultTop),
      left,
      width,
    };
  }, [triggerLayout, calendarSize]);

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

  const yearRange = useMemo(() => {
    const current = new Date().getFullYear();
    const newest = current + YEARS_FORWARD;
    const oldest = current - YEARS_BACK;
    return Array.from({ length: newest - oldest + 1 }, (_, i) => newest - i);
  }, []);

  // Open the year grid already scrolled to the year in view.
  const yearScrollOffset = useMemo(() => {
    const index = yearRange.indexOf(calendarCursor.getFullYear());
    if (index < 0) return 0;
    return Math.floor(index / YEAR_COLUMNS) * YEAR_ROW_HEIGHT;
  }, [yearRange, calendarCursor]);

  const handleYearSelection = useCallback((year: number) => {
    setCalendarCursor((prev) => {
      const next = new Date(prev);
      next.setFullYear(year);
      return next;
    });
    setView("months");
  }, []);

  const handleMonthSelection = useCallback((monthIndex: number) => {
    setCalendarCursor((prev) => {
      const next = new Date(prev);
      // Set the day first so e.g. 31 Jan -> Feb does not roll into March.
      next.setDate(1);
      next.setMonth(monthIndex);
      return next;
    });
    setView("days");
  }, []);

  const today = new Date();
  const isActive = isFocused || isCalendarOpen;

  const header = (
    <View className="flex-row items-center justify-between">
      <Pressable
        onPress={goToPreviousMonth}
        hitSlop={8}
        disabled={view !== "days"}
        style={{ opacity: view === "days" ? 1 : 0 }}
      >
        <Ionicons name="chevron-back" size={18} color={COLORS.textColor} />
      </Pressable>

      <Pressable
        onPress={() => setView(view === "days" ? "years" : "days")}
        hitSlop={8}
        className="flex-row items-center gap-1"
        accessibilityRole="button"
        accessibilityLabel={
          view === "days" ? "Choose month and year" : "Back to days"
        }
      >
        <Text weight="semibold" className="text-base text-textColor">
          {view === "years" ? "Select year" : monthLabel}
        </Text>
        <Ionicons
          name={view === "days" ? "chevron-down" : "chevron-up"}
          size={16}
          color={COLORS.primary_400}
        />
      </Pressable>

      <Pressable
        onPress={goToNextMonth}
        hitSlop={8}
        disabled={view !== "days"}
        style={{ opacity: view === "days" ? 1 : 0 }}
      >
        <Ionicons name="chevron-forward" size={18} color={COLORS.textColor} />
      </Pressable>
    </View>
  );

  const yearsView = (
    <ScrollView
      style={{ maxHeight: YEAR_ROW_HEIGHT * 5 }}
      contentOffset={{ x: 0, y: yearScrollOffset }}
      showsVerticalScrollIndicator={false}
      className="mt-3"
    >
      <View className="flex-row flex-wrap">
        {yearRange.map((year) => {
          const isCursorYear = year === calendarCursor.getFullYear();
          return (
            <Pressable
              key={year}
              style={{ width: "25%", height: YEAR_ROW_HEIGHT }}
              className="items-center justify-center"
              onPress={() => handleYearSelection(year)}
              accessibilityRole="button"
              accessibilityLabel={`Select year ${year}`}
            >
              <View
                className={cn(
                  "rounded-full px-3 py-1.5",
                  isCursorYear ? "bg-primary_400" : "bg-transparent",
                )}
              >
                <Text
                  weight={isCursorYear ? "semibold" : "medium"}
                  className={cn(
                    "text-sm",
                    isCursorYear ? "text-white" : "text-textColor",
                  )}
                >
                  {year}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );

  const monthsView = (
    <View className="mt-3 flex-row flex-wrap">
      {MONTHS.map((month, index) => {
        const isCursorMonth = index === calendarCursor.getMonth();
        return (
          <Pressable
            key={month}
            style={{ width: "33.3333%", height: YEAR_ROW_HEIGHT }}
            className="items-center justify-center"
            onPress={() => handleMonthSelection(index)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${month}`}
          >
            <View
              className={cn(
                "rounded-full px-4 py-1.5",
                isCursorMonth ? "bg-primary_400" : "bg-transparent",
              )}
            >
              <Text
                weight={isCursorMonth ? "semibold" : "medium"}
                className={cn(
                  "text-sm",
                  isCursorMonth ? "text-white" : "text-textColor",
                )}
              >
                {month}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const daysView = (
    <>
      <View className="mt-3 flex-row justify-between">
        {WEEKDAYS.map((weekday) => (
          <Text
            key={weekday}
            className="w-9 text-center text-xs text-textColor/50"
          >
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

  const calendarContent = (
    <>
      {header}
      {view === "years" ? yearsView : view === "months" ? monthsView : daysView}
    </>
  );

  const selectBtnIcon = renderSelectIcon?.(isCalendarOpen) || (
    <Ionicons
      name={isCalendarOpen ? "chevron-up" : "chevron-down"}
      size={20}
      color="#2A3A50"
    />
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
        {selectBtnIcon}
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
                dropdownPositionStyle,
              ]}
              onLayout={(event) => {
                const { height, width } = event.nativeEvent.layout;
                setCalendarSize((previous) => {
                  if (
                    previous &&
                    previous.height === height &&
                    previous.width === width
                  ) {
                    return previous;
                  }
                  return { height, width };
                });
              }}
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
