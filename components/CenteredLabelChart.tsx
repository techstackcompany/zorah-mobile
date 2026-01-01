import React from "react";
import { View } from "react-native";
import { Svg, Circle, Text as SvgText } from "react-native-svg";

const radius = 95;
const strokeWidth = 40;
const cx = 150;
const cy = 150;
const circumference = 2 * Math.PI * radius;

const data = [
  { label: "Food", percentage: 50, color: "#5D5FFE" },
  { label: "Transport", percentage: 25, color: "#FDBA4D" },
  { label: "Calls", percentage: 15, color: "#3EB489" },
  { label: "Data", percentage: 10, color: "#E261F3" },
];

export default function CenteredLabelChart() {
  let startAngle = 0;
  const segments = data.map((item) => {
    const angle = (item.percentage / 100) * 2 * Math.PI;
    const currentStartAngle = startAngle;
    const midAngle = currentStartAngle + angle / 2;

    const x = cx + (radius - strokeWidth / 2) * Math.cos(midAngle);
    const y = cy + (radius - strokeWidth / 2) * Math.sin(midAngle);
    const segmentLength = (item.percentage / 100) * circumference;
    const dashOffset =
      -(currentStartAngle / (2 * Math.PI)) * circumference;

    startAngle += angle;

    return {
      ...item,
      x,
      y,
      segmentLength,
      dashOffset,
    };
  });

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={300} height={300}>
        {segments
          .slice()
          .reverse()
          .map((segment) => (
            <React.Fragment key={segment.label}>
              <Circle
                cx={cx}
                cy={cy}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment.segmentLength} ${circumference}`}
                strokeDashoffset={segment.dashOffset}
                strokeLinecap="round"
                fill="none"
              />
              <SvgText
                x={segment.x}
                y={segment.y}
                fontSize={13}
                fontWeight="600"
                fill="#1A1A1A"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {segment.percentage}%
              </SvgText>
            </React.Fragment>
          ))}
      </Svg>
    </View>
  );
}
