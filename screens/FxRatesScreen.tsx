import React from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import FxChartCard from "@/components/fx/FxChartCard";
import FxConverterCard from "@/components/fx/FxConverterCard";
import FxRatesList from "@/components/fx/FxRatesList";
import CurrencySelectModal from "@/components/fx/CurrencySelectModal";
import FxSummaryCard from "@/components/fx/FxSummaryCard";
import useFxRatesScreen from "@/features/fx/useFxRatesScreen";
import { formatYLabel } from "@/lib/fxUtils";

const FxRatesScreen = () => {
  const fx = useFxRatesScreen();
  const formatY = formatYLabel;
  const formattedAmount = fx.formattedAmount;
  const toAmount = fx.toAmount;
  const fromFlag = fx.fromFlag;
  const toFlag = fx.toFlag;

  if (fx.isLoading && !fx.resolvedFxPairs.length && !fx.activeSeries.length) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-textColor/60">Loading exchange rates...</Text>
        </View>
      </MainContainer>
    );
  }

  if (fx.hasError) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={styles.loadingContainer}>
          <Text className="text-base text-textColor/70">Could not load exchange rates. Please try again.</Text>
          <View className="mt-4 w-full px-8">
            <Text weight="semibold" className="text-center text-primary-500" onPress={fx.handleRefresh}>Retry</Text>
          </View>
        </View>
      </MainContainer>
    );
  }

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer} refreshControl={<RefreshControl refreshing={fx.isRefreshing} onRefresh={fx.handleRefresh} />}>
        <FxSummaryCard pairLabel={`${String(fx.activeTrend).slice(0, 3)}/${String(fx.activeTrend).slice(3)}`} rateValue={fx.activeRateValue} changePercent={fx.activeRateChange} />

        <FxChartCard activeTrend={fx.activeTrend as any} onSelectTrend={fx.setActiveTrend as any} activeSeries={fx.activeSeries} lineChartData={fx.lineChartData} isFetchingHistory={fx.isFetchingHistory} yAxisRange={fx.yAxisRange} yAxisOffset={fx.yAxisOffset} formatYLabel={formatY} />

        <FxConverterCard formattedAmount={formattedAmount} toAmount={toAmount} onAmountChange={fx.handleAmountChange} fromCurrencyCode={fx.fromCurrency.code} toCurrencyCode={fx.toCurrency.code} fromFlag={fromFlag} toFlag={toFlag} onOpenFromCurrency={() => fx.setShowCurrencyModal({ type: "from", visible: true })} onOpenToCurrency={() => fx.setShowCurrencyModal({ type: "to", visible: true })} onSwap={() => { const a = fx.fromCurrency; fx.setFromCurrency(fx.toCurrency); fx.setToCurrency(a); }} lastUpdatedLabel={fx.lastUpdatedLabel} />

        <FxRatesList converterTab={fx.converterTab} onChangeTab={fx.setConverterTab as any} pairs={fx.resolvedFxPairs as any} isFetching={fx.isFetchingPairs} />
      </ScrollView>

      <CurrencySelectModal visible={fx.showCurrencyModal.visible} type={fx.showCurrencyModal.type} onClose={() => fx.setShowCurrencyModal({ type: "from", visible: false })} onSelect={fx.handleSelectCurrency} activeFrom={fx.fromCurrency.code} activeTo={fx.toCurrency.code} />
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
});

export default FxRatesScreen;
