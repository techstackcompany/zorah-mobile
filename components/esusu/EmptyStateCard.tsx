import Text from "@/components/ui/Text";
import { Image } from "expo-image";
import { View } from "react-native";

type EmptyStateCardProps = {
  title?: string;
  description?: string;
  imageSource?: any;
};

export default function EmptyStateCard({
  title = "No group savings",
  description = "All group savings will appear here",
  imageSource = require("@/assets/images/esusu/no-group-savings.png"),
}: EmptyStateCardProps) {
  return (
    <View className="mt-7 rounded-[28px] border border-[#E4E5EF] bg-white px-6 py-8 shadow-[0px_10px_40px_rgba(10,20,60,0.1)]">
      <Image
        source={imageSource}
        style={{
          alignSelf: "center",
          height: 160,
          width: 220,
        }}
        contentFit="contain"
      />
      <Text
        className="mt-5 text-center text-[16px] text-textColor/80"
        weight="semibold"
      >
        {title}
      </Text>
      <Text className="mt-2 text-center text-[13px] text-textColor/50">
        {description}
      </Text>
    </View>
  );
}
