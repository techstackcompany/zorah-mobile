import React from "react";
import Text from "@/components/ui/Text";

interface EsusuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const EsusuLabel = ({ children, className = "" }: EsusuLabelProps) => {
  return (
    <Text
      family="nunito"
      weight="medium"
      className={`mb-1.5 text-sm text-textColor/70 ${className}`.trim()}
    >
      {children}
    </Text>
  );
};
