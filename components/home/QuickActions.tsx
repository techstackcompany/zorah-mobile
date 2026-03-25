import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { Image, ImageSource } from "expo-image";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

type QuickAction = {
  id: string;
  label?: string;
  icon: ImageSource;
  background: string;
  aspectRatio?: 1;
};

type QuickActionsProps = {
  actions: QuickAction[];
  onActionPress: (action: QuickAction) => void;
};

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onActionPress,
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
          <Pressable
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
              />
            </View>
            {action.label && (
              <Text className="text-[11.5px] text-black" weight="semibold">
                {action.label}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default QuickActions;
