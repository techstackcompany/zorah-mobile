import COLORS from "@/constants/colors";
import {
  HeaderBackButton,
  type HeaderBackButtonProps,
} from "@react-navigation/elements";
import { useRouter } from "expo-router";

export const HeaderBack = ({
  onPress,
  tintColor = COLORS.textColor,
  displayMode = "minimal",
  ...props
}: HeaderBackButtonProps = {}) => {
  const router = useRouter();
  return (
    <HeaderBackButton
      tintColor={tintColor}
      displayMode={displayMode}
      onPress={onPress ?? (() => router.back())}
      style={[{ width: 24, height: 24 }, props.style]}
      {...props}
    />
  );
};

export const headerWithBack = {
  headerLeft: () => <HeaderBack />,
};
