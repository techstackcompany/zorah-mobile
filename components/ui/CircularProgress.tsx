import COLORS from "@/constants/colors";
import React from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CircularProgressProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 200,
  strokeWidth = 12,
  backgroundColor = COLORS.purpleLight,
  progressColor = COLORS.purple,
  children,
  className,
  style,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const progressDashoffset =
    circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={[{ width: size, height: size }, style]} className={className}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progressDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children && (
        <View className="absolute inset-0 items-center justify-center">
          {children}
        </View>
      )}
    </View>
  );
};

export default CircularProgress;
