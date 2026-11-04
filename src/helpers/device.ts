import * as Application from "expo-application";
import { Platform } from "react-native";

export async function getDeviceId(): Promise<string | null> {
  try {
    if (Platform.OS === "android") {
      // Returns a string immediately
      return Application.getAndroidId();
    } else if (Platform.OS === "ios") {
      // Async method returning a promise
      return await Application.getIosIdForVendorAsync();
    }
    return null;
  } catch (error) {
    console.error("Failed to get device ID", error);
    return null;
  }
}
