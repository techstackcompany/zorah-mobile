import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type CollapsibleCardProps = {
  title?: ReactNode;
  children: ReactNode;
  initialCollapsed?: boolean;
  onToggle?(collapsed: boolean): void;
  headerRight?: ReactNode;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  className?: string;
  contentClassName?: string;
  collapsible?: boolean;
  chevronColor?: string;
  testID?: string;
  headerBottomBorder?: boolean;
};

const CollapsibleCard = ({
  title,
  children,
  initialCollapsed = false,
  onToggle,
  headerRight,
  style,
  headerStyle,
  contentStyle,
  className,
  contentClassName,
  collapsible = true,
  chevronColor = COLORS.textColor,
  testID,
  headerBottomBorder = false,
}: CollapsibleCardProps) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const rotation = useRef(new Animated.Value(initialCollapsed ? 1 : 0)).current;

  useEffect(() => {
    setCollapsed(initialCollapsed);
    rotation.setValue(initialCollapsed ? 1 : 0);
  }, [initialCollapsed, rotation]);

  const toggle = useCallback(() => {
    if (!collapsible) return;

    const nextState = !collapsed;
    setCollapsed(nextState);

    Animated.timing(rotation, {
      toValue: nextState ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();

    onToggle?.(nextState);
  }, [collapsed, collapsible, onToggle, rotation]);

  const chevronStyle = useMemo(
    () => ({
      transform: [
        {
          rotate: rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "180deg"],
          }),
        },
      ],
    }),
    [rotation],
  );
  const hasHeader = Boolean(title) || Boolean(headerRight) || collapsible;
  const showRightSection = collapsible || Boolean(headerRight);

  const headerContent = (
    <>
      {typeof title === "string" ? (
        <Text weight="semibold" className="text-base text-textColor">
          {title}
        </Text>
      ) : (
        title
      )}

      {showRightSection ? (
        <View className="flex-row items-center gap-2">
          {headerRight}
          {collapsible ? (
            <Animated.View style={chevronStyle}>
              <Ionicons name="chevron-up" size={20} color={chevronColor} />
            </Animated.View>
          ) : null}
        </View>
      ) : null}
    </>
  );

  return (
    <View style={[styles.card, style]} className={className} testID={testID}>
      {hasHeader ? (
        collapsible ? (
          <Pressable
            onPress={toggle}
            style={[
              { paddingVertical: 20, paddingHorizontal:20 },
              headerStyle,
              headerBottomBorder ? styles.headerBottomBorder : null,
            ]}
            className="flex-row items-center justify-between"
            accessibilityRole="button"
            accessibilityState={{ expanded: !collapsed }}
          >
            {headerContent}
          </Pressable>
        ) : (
          <View
            style={[
              headerStyle,
              headerBottomBorder ? styles.headerBottomBorder : null,
            ]}
            className="flex-row items-center justify-between"
          >
            {headerContent}
          </View>
        )
      ) : null}

      {!collapsible || !collapsed ? (
        <View style={contentStyle} className={contentClassName}>
          {children}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  headerBottomBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.grey,
  },
});

export default CollapsibleCard;
