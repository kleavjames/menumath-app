import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Button, Pill, Stepper, StepperInput, Text } from "@/components/atoms";
import { BackButton, SelectInput, TextInput } from "@/components/molecules";
import { router } from "expo-router";

const BUSINESS_TYPES = [
  "Café",
  "Restaurant",
  "Bakery",
  "Food truck",
  "Catering",
  "Bar",
] as const;

type BusinessType = (typeof BUSINESS_TYPES)[number];

const CURRENCY_OPTIONS = [
  { label: "USD — US Dollar", value: "USD" },
  { label: "EUR — Euro", value: "EUR" },
  { label: "GBP — British Pound", value: "GBP" },
  { label: "CAD — Canadian Dollar", value: "CAD" },
  { label: "AUD — Australian Dollar", value: "AUD" },
  { label: "PHP — Philippine Peso", value: "PHP" },
];

type FieldErrors = {
  businessName?: string;
  businessType?: string;
};

const CreateBusiness = () => {
  const insets = useSafeAreaInsets();
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("Café");
  const [currency, setCurrency] = useState("USD");
  const [targetFoodCost, setTargetFoodCost] = useState(30);
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!businessName.trim()) {
      next.businessName = "Business name is required";
    }
    if (!businessType) {
      next.businessType = "Select a business type";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // TODO:
  const handleContinue = () => {
    router.push("/invite-members");
    // if (!validate()) return;
    // TODO: continue to step 2
  };

  const handleEnterInviteCode = () => {
    router.push("/invite-code");
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
          marginBottom: insets.bottom,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackButton />
          <Stepper current={1} total={2} />

          <View style={styles.hero}>
            <Text variant="hero" style={styles.headline}>
              Your business
            </Text>
            <Text color="textSecondary">
              Used for costing defaults. You can change this later.
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Business name"
              value={businessName}
              onChangeText={(value) => {
                setBusinessName(value);
                clearError("businessName");
              }}
              placeholder="Your business name"
              autoCapitalize="words"
              autoComplete="organization"
              textContentType="organizationName"
              error={errors.businessName}
            />

            <View style={styles.field}>
              <Text
                variant="label"
                color={errors.businessType ? "error" : "textSecondary"}
              >
                Type
              </Text>
              <View style={styles.chips}>
                {BUSINESS_TYPES.map((type) => (
                  <Pill
                    key={type}
                    selected={businessType === type}
                    onPress={() => {
                      setBusinessType(type);
                      clearError("businessType");
                    }}
                  >
                    {type}
                  </Pill>
                ))}
              </View>
              {errors.businessType ? (
                <Text variant="caption" color="error">
                  {errors.businessType}
                </Text>
              ) : null}
            </View>

            <SelectInput
              label="Currency"
              options={CURRENCY_OPTIONS}
              value={currency}
              snapPointsArr={["25%", "50%"]}
              onSelect={setCurrency}
            />

            <View style={styles.targetRow}>
              <View style={styles.targetCopy}>
                <Text variant="label" color="textSecondary">
                  Target food cost
                </Text>
                <Text variant="caption" color="textSecondary">
                  Recipes above this get flagged
                </Text>
              </View>
              <StepperInput
                value={targetFoodCost}
                onChange={setTargetFoodCost}
                min={1}
                max={100}
                suffix="%"
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button onPress={handleContinue}>Continue</Button>
            <Pressable
              accessibilityRole="link"
              onPress={handleEnterInviteCode}
              hitSlop={8}
            >
              <Text variant="label" color="textSecondary" style={styles.footer}>
                Joining an existing team?{" "}
                <Text variant="label" color="text" style={styles.link}>
                  Enter invite code
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.gap(3),
  },
  content: {
    flexGrow: 1,
    gap: theme.gap(4),
    paddingBottom: theme.gap(3),
  },
  hero: {
    gap: theme.gap(1.5),
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
  },
  form: {
    gap: theme.gap(3),
  },
  field: {
    gap: theme.gap(1),
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.gap(1),
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
  },
  targetCopy: {
    flex: 1,
    gap: theme.gap(0.5),
  },
  actions: {
    marginTop: "auto",
    gap: theme.gap(2.5),
  },
  footer: {
    textAlign: "center",
    lineHeight: 20,
  },
  link: {
    fontFamily: theme.fontFamily.semiBold,
    textDecorationLine: "underline",
  },
}));

export default CreateBusiness;
