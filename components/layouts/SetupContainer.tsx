import { cn } from "@/lib/utils";
import React, { PropsWithChildren } from "react";
import {
  SafeAreaView,
  SafeAreaViewProps,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface SetupContainerProps extends PropsWithChildren<SafeAreaViewProps> {
  bottomInsetOffset?: number;
}

const SetupContainer = ({
  children,
  className,
  style,
  bottomInsetOffset = 20,
  edges,
  ...rest
}: SetupContainerProps) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <SafeAreaView
      {...rest}
      edges={edges ?? [ "bottom"]}
      className={cn("bg-lightMuted flex-1", className)}
      style={[
        { paddingBottom: bottom + bottomInsetOffset, paddingTop: 0 },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

export default SetupContainer;
