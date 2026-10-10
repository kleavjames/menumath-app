import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { StyleSheet } from "react-native-unistyles";

import { ToggleButton, type ToggleOption } from "../atoms";

export type ButtonGroupTab = ToggleOption;

type ButtonGroupViewProps = {
  tabs: ButtonGroupTab[];
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  scrollEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const getTabIndex = (tabs: ButtonGroupTab[], value?: string) => {
  if (!value) return 0;
  const index = tabs.findIndex((tab) => tab.value === value);
  return index >= 0 ? index : 0;
};

export const ButtonGroupView = ({
  tabs,
  children,
  value,
  defaultValue,
  onChange,
  scrollEnabled = true,
  style,
}: ButtonGroupViewProps) => {
  const pagerRef = useRef<PagerView>(null);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? tabs[0]?.value ?? "",
  );

  const selectedValue = isControlled ? value : internalValue;
  const selectedIndex = getTabIndex(tabs, selectedValue);
  const pages = Children.toArray(children);

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  useEffect(() => {
    if (!isControlled) return;
    pagerRef.current?.setPage(selectedIndex);
  }, [isControlled, selectedIndex]);

  const handleTabChange = (nextValue: string) => {
    updateValue(nextValue);
    const nextIndex = getTabIndex(tabs, nextValue);
    pagerRef.current?.setPage(nextIndex);
  };

  const handlePageSelected = (event: PagerViewOnPageSelectedEvent) => {
    const nextValue = tabs[event.nativeEvent.position]?.value;
    if (!nextValue || nextValue === selectedValue) return;
    updateValue(nextValue);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <ToggleButton
        options={tabs}
        value={tabs[selectedIndex]?.value ?? tabs[0].value}
        onChange={handleTabChange}
      />

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={selectedIndex}
        scrollEnabled={scrollEnabled}
        onPageSelected={handlePageSelected}
      >
        {pages.map((page, index) => (
          <View
            key={tabs[index]?.value ?? `page-${index}`}
            style={styles.page}
            collapsable={false}
          >
            {page}
          </View>
        ))}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.gap(2),
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
}));
