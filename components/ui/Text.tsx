import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { cn } from "@/lib/utils"; 

type FontWeight = "regular" | "medium" | "semibold" | "bold";
type FontFamily = "degular" | "nunito";

interface Props extends RNTextProps {
  family?: FontFamily;
  weight?: FontWeight;
  italic?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Text({
  family = "nunito",
  weight = "medium",
  italic = false,
  className = "",
  style,
  ...props
}: Props) {
  const getFontName = (): string => {
    const fam = family.charAt(0).toUpperCase() + family.slice(1);
    const w =
      weight === "regular" ? "" : weight.charAt(0).toUpperCase() + weight.slice(1);
    const i = italic ? "Italic" : "";
    return `${fam}${w}${i}`;
  };

  return (
    <RNText
      {...props}
      style={[{ fontFamily: getFontName() }, style]}
      className={cn("text-textColor font-degular", className)}
    />
  );
}
