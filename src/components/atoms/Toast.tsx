import { Platform } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

type ToastDuration = "short" | "long";
type ToastPosition = "top" | "center" | "bottom";
type ToastVariant = "default" | "success" | "error";

export type ShowToastOptions = {
  duration?: ToastDuration;
  position?: ToastPosition;
  variant?: ToastVariant;
};

type NativeToast = {
  SHORT: number;
  LONG: number;
  TOP: number;
  BOTTOM: number;
  CENTER: number;
  showWithGravity: (
    message: string,
    duration: number,
    gravity: number,
    options?: {
      textColor?: string;
      backgroundColor?: string;
      tapToDismissEnabled?: boolean;
    },
  ) => void;
};

const getNativeToast = (): NativeToast | null => {
  if (Platform.OS === "web") return null;
  return require("react-native-simple-toast").default as NativeToast;
};

export const showToast = (message: string, options?: ShowToastOptions) => {
  const toast = getNativeToast();
  if (!toast) return;

  const theme = UnistylesRuntime.getTheme();
  const duration = options?.duration === "short" ? toast.SHORT : toast.LONG;
  const position =
    options?.position === "top"
      ? toast.TOP
      : options?.position === "center"
        ? toast.CENTER
        : toast.BOTTOM;

  const backgroundColor =
    options?.variant === "error"
      ? theme.colors.error
      : options?.variant === "success"
        ? theme.colors.primary
        : theme.colors.text;

  toast.showWithGravity(message, duration, position, {
    backgroundColor,
    textColor: theme.colors.background,
    tapToDismissEnabled: true,
  });
};
