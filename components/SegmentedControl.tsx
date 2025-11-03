import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Pressable, View } from "react-native";

type Segment = {
  key: string;
  label: string;
};

type Props = {
  segments: Segment[];
  activeKey: string;
  onChange: (key: string) => void;
};

const SegmentedControl: React.FC<Props> = ({ segments, activeKey, onChange }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const indicator = useRef(new Animated.Value(0)).current;

  const activeIndex = useMemo(
    () => Math.max(0, segments.findIndex((segment) => segment.key === activeKey)),
    [activeKey, segments],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    if (containerWidth === 0) return;
    const segmentWidth = containerWidth / segments.length;
    Animated.spring(indicator, {
      toValue: segmentWidth * activeIndex,
      useNativeDriver: true,
      stiffness: 180,
      damping: 18,
      mass: 0.6,
    }).start();
  }, [activeIndex, containerWidth, indicator, segments.length]);

  const segmentWidth = containerWidth / segments.length || 0;

  return (
    <View
      onLayout={handleLayout}
      className="relative h-14 flex-row items-center rounded-full bg-[#F3F4F6] px-1"
    >
      {containerWidth > 0 ? (
        <Animated.View
          className="absolute left-1 top-1 bottom-1 rounded-full bg-white shadow-sm"
          style={{
            width: segmentWidth - 2,
            transform: [{ translateX: indicator }],
            shadowColor: "#000000",
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        />
      ) : null}

      {segments.map((segment) => {
        const isActive = segment.key === activeKey;
        return (
          <Pressable
            key={segment.key}
            onPress={() => onChange(segment.key)}
            className="flex-1 items-center justify-center"
            hitSlop={10}
          >
            <View pointerEvents="none">
              <Text
                family="nunito"
                weight={isActive ? "semibold" : "medium"}
                className={cn(
                  "text-base",
                  isActive ? "text-tertiary" : "text-[#8F95A3]",
                )}
              >
                {segment.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedControl;
