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

import {
  Button,
  Loader,
  Pill,
  showToast,
  Stepper,
  StepperInput,
  Text,
} from "@/components/atoms";
import { BackButton, SelectInput, TextInput } from "@/components/molecules";
import { BUSINESS_TYPE_OPTIONS, CURRENCY_OPTIONS } from "@/constants/business";
import { useAuth } from "@/provider/AuthProvider";
import { signUp } from "@/service/api/auth";
import { useCreateAccountStore } from "@/store/createAccount";
import { BusinessType, Currency } from "@/types/business";
import { ApiError } from "@/types/common";
import { router } from "expo-router";

type FieldErrors = {
  businessName?: string;
  businessType?: string;
};

const CreateBusiness = () => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>(
    BusinessType.CAFE,
  );
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [targetFoodCost, setTargetFoodCost] = useState(30);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fullName = useCreateAccountStore((state) => state.fullName);
  const username = useCreateAccountStore((state) => state.username);
  const password = useCreateAccountStore((state) => state.password);

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

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await signUp({
        fullName,
        username,
        password,
        business: {
          name: businessName,
          type: businessType,
          currency,
          targetFoodCost,
        },
      });

      login(response.accessToken);
      showToast("Business created successfully", { variant: "default" });
      router.push("/(app)/(recipes)");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnterInviteCode = () => {
    router.push("/invite-code");
  };

  return (
    <>
      <Loader visible={loading} text="Creating your account..." />
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
                  {BUSINESS_TYPE_OPTIONS.map(({ value, label }) => (
                    <Pill
                      key={value}
                      selected={businessType === value}
                      onPress={() => {
                        setBusinessType(value);
                        clearError("businessType");
                      }}
                    >
                      {label}
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
                snapPointsArr={["50%"]}
                onSelect={(value) => setCurrency(value as Currency)}
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
                <Text
                  variant="label"
                  color="textSecondary"
                  style={styles.footer}
                >
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
    </>
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
