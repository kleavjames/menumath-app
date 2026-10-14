import { router, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Card, Text } from "@/components/atoms";
import { ButtonGroupView } from "@/components/molecules";
import { IMPERIAL_OPTIONS, METRIC_OPTIONS } from "@/constants";
import { useAccountUserStore } from "@/store";
import { MetricUnit, UnitOption, UnitSystem } from "@/types";

const UNIT_SYSTEM_TABS = [
  { label: "Metric", value: UnitSystem.METRIC },
  { label: "Imperial", value: UnitSystem.IMPERIAL },
  { label: "Both", value: UnitSystem.BOTH },
];

const UNIT_GROUPS: { label: string; units: MetricUnit[] }[] = [
  {
    label: "Weight",
    units: [MetricUnit.G, MetricUnit.KG, MetricUnit.OZ, MetricUnit.LB],
  },
  {
    label: "Volume",
    units: [
      MetricUnit.ML,
      MetricUnit.L,
      MetricUnit.TSP,
      MetricUnit.TBSP,
      MetricUnit.CUP,
      MetricUnit.GAL,
    ],
  },
  {
    label: "Count",
    units: [MetricUnit.EACH, MetricUnit.DOZEN],
  },
];

const PREFERRED_COST_UNITS: Record<string, MetricUnit[]> = {
  Weight: [MetricUnit.KG, MetricUnit.LB],
  Volume: [MetricUnit.L, MetricUnit.GAL],
  Count: [MetricUnit.EACH],
};

const unitsForSystem = (system: UnitSystem): UnitOption[] => {
  if (system === UnitSystem.METRIC) return METRIC_OPTIONS;
  if (system === UnitSystem.IMPERIAL) return IMPERIAL_OPTIONS;

  const seen = new Set<string>();
  return [...METRIC_OPTIONS, ...IMPERIAL_OPTIONS].filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
};

const groupedUnits = (options: UnitOption[]) => {
  const byValue = new Map(options.map((option) => [option.value, option]));

  return UNIT_GROUPS.map((group) => ({
    label: group.label,
    options: group.units.flatMap((unit) => {
      const option = byValue.get(unit);
      return option ? [option] : [];
    }),
  })).filter((group) => group.options.length > 0);
};

const costSummary = (groups: ReturnType<typeof groupedUnits>) =>
  groups
    .map((group) => {
      const preferred = PREFERRED_COST_UNITS[group.label] ?? [];
      const match = preferred
        .map((unit) => group.options.find((option) => option.value === unit))
        .find(Boolean);
      return (match ?? group.options[0])?.label;
    })
    .filter(Boolean)
    .join(" · ");

const UnitPage = ({ system }: { system: UnitSystem }) => {
  const groups = groupedUnits(unitsForSystem(system));

  return (
    <ScrollView
      contentContainerStyle={styles.pageContent}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
      <Text variant="label" color="textSecondary">
        Controls which units appear when you add ingredients and build recipes.
        Costs convert automatically.
      </Text>

      {groups.map((group) => (
        <View key={group.label} style={styles.section}>
          <Text variant="label" color="textSecondary">
            {group.label}
          </Text>
          <View style={styles.chips}>
            {group.options.map((option) => (
              <View key={option.value} style={styles.chip}>
                <Text style={styles.chipLabel}>{option.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Show unit costs per</Text>
        <Text color="textSecondary" style={styles.summaryValue}>
          {costSummary(groups)}
        </Text>
      </Card>
    </ScrollView>
  );
};

export default function UnitSystemScreen() {
  const insets = useSafeAreaInsets();
  const business = useAccountUserStore((state) => state.business);
  const [unitSystem, setUnitSystem] = useState(
    business?.unitSystem ?? UnitSystem.BOTH,
  );

  // TODO: update business unit system
  const handleChange = (value: string) => {
    if (value === unitSystem) return;
    setUnitSystem(value as UnitSystem);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: "Units",
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
        <Text variant="label" color="textSecondary">
          Measurement system
        </Text>
        <ButtonGroupView
          tabs={UNIT_SYSTEM_TABS}
          value={unitSystem}
          onChange={handleChange}
          groupButtonStyle={styles.groupButton}
          style={styles.group}
        >
          <UnitPage system={UnitSystem.METRIC} />
          <UnitPage system={UnitSystem.IMPERIAL} />
          <UnitPage system={UnitSystem.BOTH} />
        </ButtonGroupView>
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.gap(3),
    gap: theme.gap(1),
  },
  group: {
    flex: 1,
  },
  groupButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
  },
  pageContent: {
    gap: theme.gap(3),
    paddingBottom: theme.gap(4),
  },
  section: {
    gap: theme.gap(1),
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.gap(1),
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
  },
  chipLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.medium,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
  },
  summaryLabel: {
    fontFamily: theme.fontFamily.semiBold,
  },
  summaryValue: {
    flexShrink: 1,
    textAlign: "right",
  },
  headerButton: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  backButtonText: {
    color: theme.colors.text,
  },
}));
