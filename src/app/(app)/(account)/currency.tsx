import { router, Stack } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Card, Text } from "@/components/atoms";
import { CURRENCIES } from "@/constants/business";
import { useAccountUserStore } from "@/store/accountUser";
import { Currency } from "@/types/business";

export default function CurrencyScreen() {
  const insets = useSafeAreaInsets();
  const business = useAccountUserStore((state) => state.business);

  const selectedCurrency = business?.currency ?? Currency.USD;

  // TODO: update business currency
  const handleSelect = (currency: Currency) => {
    if (currency === selectedCurrency) return;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: "Currency",
          headerLeft: () => (
            <Pressable onPressIn={router.back} style={styles.headerButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          ),
        }}
      />
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top * 2, paddingBottom: insets.bottom },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.listCard}>
            {CURRENCIES.map((currency, index) => {
              const isSelected = currency.value === selectedCurrency;

              return (
                <View key={currency.value}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${currency.value} ${currency.name}`}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && styles.rowPressed,
                    ]}
                    onPress={() => handleSelect(currency.value)}
                  >
                    <Text
                      color={isSelected ? "primary" : "text"}
                      style={styles.code}
                    >
                      {currency.value}
                    </Text>
                    <Text
                      color={isSelected ? "primary" : "text"}
                      style={styles.name}
                    >
                      {currency.name}
                    </Text>
                    <Text
                      color={isSelected ? "primary" : "textSecondary"}
                      style={styles.symbol}
                    >
                      {currency.symbol}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </Card>

          <Text variant="caption" color="textSecondary" style={styles.hint}>
            Switching currency changes how prices are displayed. Existing
            amounts aren't converted.
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.gap(3),
  },
  content: {
    gap: theme.gap(2),
    paddingBottom: theme.gap(4),
  },
  listCard: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.5),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  rowPressed: {
    opacity: 0.7,
  },
  code: {
    width: theme.gap(5),
    fontFamily: theme.fontFamily.medium,
  },
  name: {
    flex: 1,
  },
  symbol: {
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.gap(2.5),
  },
  hint: {
    paddingHorizontal: theme.gap(0.5),
  },
  headerButton: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  backButtonText: {
    color: theme.colors.text,
  },
}));
