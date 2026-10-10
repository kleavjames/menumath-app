import { SymbolView } from "expo-symbols";
import { Pressable, TextInput as RNTextInput, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, Text } from "@/components/atoms";

export type MethodStep = {
  id: number;
  text: string;
};

export type RecipeMethodsProps = {
  steps: MethodStep[];
  onChange: (steps: MethodStep[]) => void;
};

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.text,
}));

const UniSymbolMuted = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

const UniSymbolWhite = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.background,
}));

const UniTextInput = withUnistyles(RNTextInput, (theme) => ({
  placeholderTextColor: theme.colors.textSecondary,
}));

export const RecipeMethods = ({ steps, onChange }: RecipeMethodsProps) => {
  const addStep = () => {
    const nextId = steps.reduce((max, step) => Math.max(max, step.id), 0) + 1;
    onChange([...steps, { id: nextId, text: "" }]);
  };

  const updateStep = (stepId: number, text: string) => {
    onChange(
      steps.map((step) => (step.id === stepId ? { ...step, text } : step)),
    );
  };

  const removeStep = (stepId: number) => {
    onChange(steps.filter((step) => step.id !== stepId));
  };

  const moveStep = (fromIndex: number, direction: -1 | 1) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= steps.length) return;

    const next = [...steps];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Method
          {steps.length > 0 ? (
            <Text style={styles.sectionCount}> {steps.length}</Text>
          ) : null}
        </Text>
        <Text variant="label" color="textSecondary">
          Visible to all staff
        </Text>
      </View>

      {steps.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text color="textSecondary" style={styles.emptyText}>
            Write the steps so anyone on the team can prepare this the same
            way.
          </Text>
        </View>
      ) : (
        <View style={styles.stepList}>
          {steps.map((step, index) => (
            <Card key={step.id} style={styles.stepCard}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove step ${index + 1}`}
                hitSlop={8}
                onPress={() => removeStep(step.id)}
                style={styles.stepRemove}
              >
                <UniSymbolWhite
                  name={{
                    ios: "xmark",
                    android: "close",
                    web: "close",
                  }}
                  size={8}
                />
              </Pressable>

              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>

                <UniTextInput
                  accessibilityLabel={`Step ${index + 1}`}
                  style={styles.stepInput}
                  value={step.text}
                  onChangeText={(value) => updateStep(step.id, value)}
                  placeholder="Describe this step"
                  multiline
                  autoFocus={step.text === ""}
                  textAlignVertical="top"
                />

                <View style={styles.stepActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Move step ${index + 1} up`}
                    disabled={index === 0}
                    hitSlop={8}
                    onPress={() => moveStep(index, -1)}
                    style={index === 0 && styles.stepActionDisabled}
                  >
                    <UniSymbolMuted
                      name={{
                        ios: "chevron.up",
                        android: "keyboard_arrow_up",
                        web: "keyboard_arrow_up",
                      }}
                      size={16}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Move step ${index + 1} down`}
                    disabled={index === steps.length - 1}
                    hitSlop={8}
                    onPress={() => moveStep(index, 1)}
                    style={
                      index === steps.length - 1 && styles.stepActionDisabled
                    }
                  >
                    <UniSymbolMuted
                      name={{
                        ios: "chevron.down",
                        android: "keyboard_arrow_down",
                        web: "keyboard_arrow_down",
                      }}
                      size={16}
                    />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.pressed,
        ]}
        onPress={addStep}
      >
        <UniSymbol
          name={{ ios: "plus", android: "add", web: "add" }}
          size={14}
        />
        <Text style={styles.addButtonLabel}>Add step</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.gap(1.5),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  sectionCount: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: theme.colors.border,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.gap(3),
    paddingHorizontal: theme.gap(3),
  },
  emptyText: {
    textAlign: "center",
  },
  stepList: {
    gap: theme.gap(1.5),
  },
  stepCard: {
    position: "relative",
    overflow: "visible",
    paddingVertical: theme.gap(1.5),
    paddingHorizontal: theme.gap(2),
    paddingTop: theme.gap(2),
  },
  stepRemove: {
    position: "absolute",
    top: -theme.gap(0.5),
    right: -theme.gap(0.5),
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
    backgroundColor: theme.colors.textSecondary,
    borderRadius: 9999,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.gap(1.5),
  },
  stepNumber: {
    width: 24,
    height: 24,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepNumberText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  stepInput: {
    flex: 1,
    minHeight: 28,
    padding: 0,
    margin: 0,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  stepActions: {
    alignItems: "center",
    gap: theme.gap(0.75),
  },
  stepActionDisabled: {
    opacity: 0.3,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.gap(1),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.gap(2),
  },
  addButtonLabel: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
}));
