import { router, Stack } from "expo-router";
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

import { Pill, Text } from "@/components/atoms";
import { TextInput } from "@/components/molecules";
import { BUSINESS_TYPE_OPTIONS } from "@/constants/business";
import { useAccountUserStore } from "@/store/accountUser";
import { BusinessType } from "@/types/business";

type FieldErrors = {
  businessName?: string;
  businessType?: string;
};

export default function BusinessScreen() {
  const insets = useSafeAreaInsets();
  const business = useAccountUserStore((state) => state.business);

  const [businessName, setBusinessName] = useState(business?.name ?? "");
  const [businessType, setBusinessType] = useState<BusinessType>(
    business?.type ?? BusinessType.CAFE,
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
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

  const handleSave = () => {
    if (!validate()) return;
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: "Business",
          headerLeft: () => (
            <Pressable onPressIn={router.back} style={styles.headerButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPressIn={handleSave} style={styles.headerButton}>
              <Text style={styles.saveButtonText}>Save</Text>
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
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

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
    gap: theme.gap(3),
    paddingBottom: theme.gap(4),
  },
  field: {
    gap: theme.gap(1),
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.gap(1),
  },
  headerButton: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  saveButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
}));
