import React from "react";
import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

type ChartBar = {
  value: number;
  label: string;
  frontColor: string;
};

type OverviewChartProps = {
  bars: ChartBar[];
};

const OverviewChart: React.FC<OverviewChartProps> = ({ bars }) => {
  return (
    <View className="mt-6 rounded-3xl bg-white px-5 pb-6 pt-4 shadow-lg shadow-black/5">
      <View className="mx-auto w-full overflow-hidden">
        <BarChart
          data={bars}
          width={300}
          height={170}
          barWidth={24}
          barBorderRadius={12}
          spacing={18}
          noOfSections={5}
          yAxisThickness={0}
          xAxisThickness={0}
          labelWidth={32}
          xAxisLabelTextStyle={{
            fontFamily: "NunitoMedium",
            fontSize: 12,
            color: "#969EB2",
          }}
          rulesColor="#F1F2F6"
          xAxisColor="#ffffff"
          yAxisTextStyle={{
            color: "transparent",
          }}
          disableScroll
          frontColor="red"
          maxValue={110}
          hideYAxisText
          hideRules
          showGradient
        />
      </View>
    </View>
  );
};

export default OverviewChart;
