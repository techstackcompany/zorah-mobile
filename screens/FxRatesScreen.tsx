import CurrencySelectModal from "@/components/fx/CurrencySelectModal";
import FxChartCard from "@/components/fx/FxChartCard";
import FxConverterCard from "@/components/fx/FxConverterCard";
import FxRatesList from "@/components/fx/FxRatesList";
import FxSummaryCard from "@/components/fx/FxSummaryCard";
import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useFxRatesScreen } from "@/features/fx/hooks";
import { formatYLabel } from "@/features/fx/utils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

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
          <Text className="mt-4 text-textColor/60">
            Loading exchange rates...
          </Text>
        </View>
      </MainContainer>
    );
  }

  if (
    fx.hasError &&
    !fx.resolvedFxPairs.length &&
    !fx.activeSeries.length &&
    fx.activeRateValue === 0
  ) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={styles.loadingContainer}>
          <Text className="text-base text-textColor/70">
            Could not load exchange rates. Please try again.
          </Text>
          <View className="mt-4 w-full px-8">
            <Text
              weight="semibold"
              className="text-primary-500 text-center"
              onPress={fx.handleRefresh}
            >
              Retry
            </Text>
          </View>
        </View>
      </MainContainer>
    );
  }

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={fx.isRefreshing}
            onRefresh={fx.handleRefresh}
          />
        }
      >
        {fx.isStale && (
          <View style={styles.staleBanner}>
            <Ionicons
              name="cloud-offline-outline"
              size={16}
              color={COLORS.amber}
            />
            <Text className="ml-2 text-sm" style={{ color: COLORS.amber }}>
              Showing cached data. Pull to refresh.
            </Text>
          </View>
        )}

        <FxSummaryCard
          pairLabel={`${String(fx.activeTrend).slice(0, 3)}/${String(fx.activeTrend).slice(3)}`}
          rateValue={fx.activeRateValue}
          changePercent={fx.activeRateChange}
        />

        <FxChartCard
          activeTrend={fx.activeTrend as any}
          onSelectTrend={fx.setActiveTrend as any}
          activeSeries={fx.activeSeries}
          lineChartData={fx.lineChartData}
          isFetchingHistory={fx.isFetchingHistory}
          yAxisRange={fx.yAxisRange}
          yAxisOffset={fx.yAxisOffset}
          formatYLabel={formatY}
        />

        <FxConverterCard
          formattedAmount={formattedAmount}
          toAmount={toAmount}
          onAmountChange={fx.handleAmountChange}
          fromCurrencyCode={fx.fromCurrency.code}
          toCurrencyCode={fx.toCurrency.code}
          fromFlag={fromFlag}
          toFlag={toFlag}
          onOpenFromCurrency={() => {
            fx.setCurrencyModalType("from");
            fx.currencyModalOpen.value = true;
          }}
          onOpenToCurrency={() => {
            fx.setCurrencyModalType("to");
            fx.currencyModalOpen.value = true;
          }}
          onSwap={() => {
            const a = fx.fromCurrency;
            fx.setFromCurrency(fx.toCurrency);
            fx.setToCurrency(a);
          }}
          lastUpdatedLabel={fx.lastUpdatedLabel}
        />

        <FxRatesList
          converterTab={fx.converterTab}
          onChangeTab={fx.setConverterTab as any}
          pairs={fx.resolvedFxPairs as any}
          isFetching={fx.isFetchingPairs}
        />
      </ScrollView>

      <CurrencySelectModal
        isOpen={fx.currencyModalOpen}
        type={fx.currencyModalType}
        onClose={() => (fx.currencyModalOpen.value = false)}
        onSelect={fx.handleSelectCurrency}
        activeFrom={fx.fromCurrency.code}
        activeTo={fx.toCurrency.code}
      />
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
  staleBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
});

export default FxRatesScreen;
