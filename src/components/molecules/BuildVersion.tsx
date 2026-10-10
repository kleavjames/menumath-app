import * as Application from "expo-application";

import { StyleSheet } from "react-native-unistyles";
import { Text } from "../atoms";

const { nativeApplicationVersion, nativeBuildVersion } = Application;

export const BuildVersion = () => {
  return (
    <Text color="textSecondary" variant="caption" style={styles.version}>
      version {nativeApplicationVersion}.{nativeBuildVersion}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  version: {
    textAlign: "center",
  },
}));
