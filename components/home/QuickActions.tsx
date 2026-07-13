import { ScalePressable } from "@/components/ui/ScalePressable";
import Text from "@/components/ui/Text";
import { FeatureGridItem, QuickAction } from "@/constants/home";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

type QuickActionsProps = {
  actions: QuickAction[];
  onActionPress: (action: QuickAction) => void;
  featureGridItems?: FeatureGridItem[];
  onFeatureGridPress?: (item: FeatureGridItem) => void;
};

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onActionPress,
  featureGridItems,
  onFeatureGridPress,
}) => {
  return (
    <View className="mt-4">
      <Text weight="semibold" className="text-lg">
        Quick Actions
      </Text>
      <ScrollView
        horizontal
        scrollEnabled
        contentContainerClassName="gap-3"
        showsHorizontalScrollIndicator={false}
        className="mt-4 flex-row gap-3"
      >
        {actions.map((action) => (
          <ScalePressable
            key={action.id}
            onPress={() => onActionPress(action)}
            className={cn(
              "flex-row items-center gap-2 rounded-full border border-grayLight px-3 py-2",
              action.background,
              action.aspectRatio === 1 && "aspect-square",
            )}
          >
            <View className="h-6 w-6 items-center justify-center rounded-full">
              <Image
                source={action.icon}
                style={{ aspectRatio: 1, width: "100%" }}
                contentFit="contain"
                tintColor={action.iconTintColor}
              />
            </View>
            {action.label && (
              <Text className="text-[11.5px] text-black" weight="semibold">
                {action.label}
              </Text>
            )}
          </ScalePressable>
        ))}
      </ScrollView>

      {featureGridItems && featureGridItems.length > 0 && (
        <View style={styles.gridContainer}>
          {featureGridItems.map((item) => (
            <ScalePressable
              key={item.id}
              scaleTo={0.94}
              style={styles.gridItem}
              onPress={() => onFeatureGridPress?.(item)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View
                style={[
                  styles.gridIconWrapper,
                  { backgroundColor: item.iconBackground },
                ]}
              >
                <Image
                  source={item.icon}
                  style={styles.gridIcon}
                  contentFit="contain"
                  tintColor={item.iconTint}
                />
              </View>
              <Text weight="medium" style={styles.gridLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </ScalePressable>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  gridItem: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  gridIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridIcon: {
    width: 24,
    height: 24,
  },
  gridLabel: {
    fontSize: 12,
    color: "#2A3A50",
    textAlign: "center",
    lineHeight: 16,
  },
});

export default QuickActions;
