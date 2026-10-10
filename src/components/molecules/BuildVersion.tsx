import * as Application from "expo-application";

import { Text } from "../atoms";

const { nativeApplicationVersion, nativeBuildVersion } = Application;

export const BuildVersion = () => {
  return (
    <Text color="textSecondary" variant="caption">
      MenuMath {nativeApplicationVersion} ({nativeBuildVersion})
    </Text>
  );
};
