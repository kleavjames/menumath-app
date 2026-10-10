import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef, type ReactNode } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  options: SelectOption[];
  selected?: string;
  onSelect: (value: string) => void;
  children: ReactNode;
  snapPointsArr?: string[];
  onOpen?: () => void;
};

export const Select = ({
  options,
  selected,
  onSelect,
  children,
  snapPointsArr = ["25%", "50%", "90%"],
  onOpen,
}: SelectProps) => {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => snapPointsArr, [snapPointsArr]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      sheetRef.current?.dismiss();
    },
    [onSelect],
  );

  const renderItem = useCallback(
    (item: SelectOption) => {
      const isSelected = selected === item.value;

      return (
        <Pressable
          key={item.value}
          onPress={() => handleSelect(item.value)}
          style={isSelected ? styles.selectedItem : styles.item}
        >
          <Text>{item.label}</Text>
        </Pressable>
      );
    },
    [handleSelect, selected],
  );

  return (
    <>
      <Pressable
        onPress={() => {
          onOpen?.();
          sheetRef.current?.present();
        }}
      >
        {children}
      </Pressable>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom }}
        >
          {options.map(renderItem)}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  item: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
  },
  selectedItem: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
    backgroundColor: theme.colors.surface,
  },
}));
