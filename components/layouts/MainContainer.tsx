import { cn } from "@/lib/utils";
import React, { PropsWithChildren } from "react";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";

interface Props extends PropsWithChildren, SafeAreaViewProps {}

const MainContainer = ({ children, className }: Props) => {
  return (
    <SafeAreaView  className={cn("flex-1 bg-white pb-10", className)}>
      {children}
    </SafeAreaView>
  );
};

export default MainContainer;
