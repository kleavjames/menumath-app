// ModalLoader.tsx
import React, { useEffect } from "react";
import { ActivityIndicator, Modal, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

type LoaderProps = {
  visible: boolean;
  text?: string;
};

export const Loader: React.FC<LoaderProps> = ({ visible, text }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(0.5, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.backdrop}>
        <Animated.View style={[styles.loaderContainer, animatedStyle]}>
          <ActivityIndicator size="large" />
          <Text variant="body" style={styles.text} numberOfLines={1}>
            {text || "Loading..."}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    minWidth: 120,
    minHeight: 120,
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(2.5),
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  text: {
    textAlign: "center",
    marginTop: theme.gap(1),
  },
}));
