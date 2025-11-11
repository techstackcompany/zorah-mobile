import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import { cn, extractUserData, getAccentColorForGroup } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ComponentProps, ReactNode, useMemo } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type MenuItem = {
  label: string;
  icon: IoniconName;
  active?: boolean;
  onPress?: () => void;
};

type SidebarContainerProps = {
  menuItems: MenuItem[];
  recentGroups: string[];
  footer?: ReactNode;
};

const SidebarContainer = ({
  menuItems,
  recentGroups,
  footer,
}: SidebarContainerProps) => {
  const { userData } = useSession();
  const insets = useSafeAreaInsets();

  const { displayName, displayEmail, initials } = useMemo(
    () =>
      extractUserData(userData, {
        fallbackName: "User",
        fallbackInitials: "U",
      }),
    [userData],
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }} className="bg-white  py-8">
      <View className="flex-row items-center justify-between px-6">
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ aspectRatio: 997 / 250, height: 32 }}
          accessibilityLabel="PocketMonie Logo"
        />
        <Pressable
          className="rounded-full  p-2"
          accessibilityRole="button"
          accessibilityLabel="Close sidebar"
        >
          <Ionicons name="close" size={24} color={COLORS.textColor} />
        </Pressable>
      </View>

<View className="px-6">
      <Text className="mt-8 text-smuppercase text-textColor/60">
        Esusu/Ajo
      </Text>

      <View className="mt-4 gap-2">
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            className={cn(
              "flex-row items-center justify-between rounded-2xl px-3 py-3",
            )}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: item.active }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className={cn(
                  "h-10 w-10 items-center justify-center rounded-2xl",
                )}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={item.active ? COLORS.primary_400 : COLORS.textColor}
                />
              </View>
              <Text
                className={cn(
                  "text-lg",
                  item.active ? "text-primary_400" : "text-textColor",
                )}
                weight={item.active ? "semibold" : "medium"}
              >
                {item.label}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={item.active ? COLORS.primary_400 : COLORS.textColor}
            />
          </Pressable>
        ))}
      </View>

      <Text className="mt-6 text-sm uppercase text-textColor/60">
        Recent Groups
      </Text>

      <View className="mt-3 gap-3">
        {recentGroups.map((group) => {
          const { accentColor, backgroundColor } =
            getAccentColorForGroup(group);
          return (
            <View
              key={group}
              className="flex-row items-center gap-3  px-3 py-3"
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor }}
              >
                <Ionicons name="people" size={18} color={accentColor} />
              </View>
              <Text className="text-[14px] text-[#1F2740]" weight="semibold">
                {group}
              </Text>
            </View>
            );
          })}
        </View>
      </View>

      {footer || (
        <View className="mt-auto  border-t border-grayLight/80 pt-4 px-6">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary_200">
              <Text className="text-sm text-primary_400" weight="bold">
                {initials}
              </Text>
            </View>
            <View>
              <Text className="text-base text-[#1F2740]" weight="bold">
                {displayName}
              </Text>
              {displayEmail && (
                <Text className="text-sm text-[#8F93A5]">{displayEmail}</Text>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SidebarContainer;
