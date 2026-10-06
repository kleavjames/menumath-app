import { useEffect, useState } from "react";
import {
  Pressable,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

export type ToggleOption = {
  label: string;
  value: string;
};

type ToggleButtonProps = {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

const TRACK_INSET = 4;

export const ToggleButton = ({
  options,
  value,
  onChange,
  style,
}: ToggleButtonProps) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentWidth =
    trackWidth > 0 ? (trackWidth - TRACK_INSET * 2) / options.length : 0;

  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(selectedIndex * segmentWidth, {
      duration: 200,
    });
  }, [selectedIndex, segmentWidth, translateX]);

  const thumbStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: translateX.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={[styles.track, style]} onLayout={handleLayout}>
      {segmentWidth > 0 ? (
        <Animated.View style={[styles.thumb, thumbStyle]} />
      ) : null}

      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={styles.segment}
            >
              <Text
                color={selected ? "text" : "textSecondary"}
                style={selected ? styles.labelSelected : styles.label}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  track: {
    flexDirection: "row",
    alignSelf: "stretch",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: TRACK_INSET,
  },
  thumb: {
    position: "absolute",
    top: TRACK_INSET,
    bottom: TRACK_INSET,
    left: TRACK_INSET,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    zIndex: 1,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.gap(1.25),
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
  },
  labelSelected: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.medium,
  },
}));
