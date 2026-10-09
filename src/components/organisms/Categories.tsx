import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { IngredientCategory } from "@/app/(app)/(ingredients)";
import { Pill, Text } from "@/components/atoms";

const ALL_CATEGORY = "All";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.text,
}));

const UniTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.textSecondary,
}));

type CategoriesProps = {
  categories: IngredientCategory[];
  selected: IngredientCategory;
  onSelect: (category: string) => void;
  onCreate: (name: string) => void;
  onRename: (from: string, to: string, id: string) => void;
  onDelete: (name: string) => void;
};

export const Categories = ({
  categories,
  selected,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: CategoriesProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [name, setName] = useState("");
  const inputRef = useRef<TextInput>(null);
  const editingCategoryRef = useRef<string | null>(null);

  const editingCategoryIdRef = useRef<string | null>(null);
  const nameRef = useRef("");
  const isCreatingRef = useRef(false);

  useEffect(() => {
    editingCategoryRef.current = editingCategory;
  }, [editingCategory]);

  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  useEffect(() => {
    isCreatingRef.current = isCreating;
  }, [isCreating]);

  const isNameAvailable = (value: string, except?: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.toLowerCase() === ALL_CATEGORY.toLowerCase()) return false;

    return !categories.some(
      (category) =>
        category.name.toLowerCase() === trimmed.toLowerCase() &&
        category.name !== except,
    );
  };

  const resetInput = () => {
    editingCategoryRef.current = null;
    isCreatingRef.current = false;
    nameRef.current = "";
    setName("");
    setIsCreating(false);
    setEditingCategory(null);
  };

  const finishCreating = () => {
    if (!isCreatingRef.current) return;

    const trimmed = nameRef.current.trim();
    resetInput();

    if (isNameAvailable(trimmed)) {
      onCreate(trimmed);
    }
  };

  const finishEditing = () => {
    const previous = editingCategoryRef.current;
    if (!previous) return;

    const trimmed = nameRef.current.trim();
    resetInput();

    if (trimmed && trimmed !== previous && isNameAvailable(trimmed, previous)) {
      onRename(previous, trimmed, editingCategoryIdRef.current!);
    }
  };

  const dismissActiveInput = () => {
    if (editingCategoryRef.current) {
      finishEditing();
      return;
    }

    if (isCreatingRef.current) {
      finishCreating();
    }
  };

  const startCreating = () => {
    dismissActiveInput();
    isCreatingRef.current = true;
    setEditingCategory(null);
    setName("");
    nameRef.current = "";
    setIsCreating(true);
  };

  const startEditing = (category: string, id: string) => {
    dismissActiveInput();
    editingCategoryRef.current = category;
    editingCategoryIdRef.current = id;
    nameRef.current = category;
    setIsCreating(false);
    setEditingCategory(category);
    setName(category);
  };

  const handleSelect = (category: string) => {
    dismissActiveInput();
    onSelect(category);
  };

  const handleLongPress = (category: IngredientCategory) => {
    Alert.alert(category.name, "Edit or delete this category", [
      {
        text: "Edit",
        onPress: () => startEditing(category.name, category.id),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          resetInput();
          onDelete(category.id);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderCategoryInput = (onFinish: () => void) => (
    <UniTextInput
      ref={inputRef}
      autoFocus
      value={name}
      onChangeText={setName}
      placeholder="Category name"
      returnKeyType="done"
      onSubmitEditing={() => inputRef.current?.blur()}
      onBlur={onFinish}
      style={styles.input}
      accessibilityLabel="Category name"
    />
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.row}
      onScrollBeginDrag={dismissActiveInput}
    >
      <Pill
        selected={selected?.name === ALL_CATEGORY}
        onPress={() => handleSelect(ALL_CATEGORY)}
      >
        {ALL_CATEGORY}
      </Pill>

      {categories.map((category) => {
        if (editingCategory === category.name) {
          return (
            <View key={category.id}>{renderCategoryInput(finishEditing)}</View>
          );
        }

        return (
          <Pill
            key={category.id}
            selected={selected?.name === category.name}
            onPress={() => handleSelect(category.name)}
            onLongPress={() => handleLongPress(category)}
            delayLongPress={350}
          >
            {category.name}
          </Pill>
        );
      })}

      {isCreating ? (
        renderCategoryInput(finishCreating)
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add category"
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={startCreating}
        >
          <UniSymbol
            name={{ ios: "plus", android: "add", web: "add" }}
            size={14}
          />
          <Text style={styles.addLabel}>Category</Text>
        </Pressable>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(3),
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(0.5),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    borderRadius: 9999,
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    backgroundColor: "transparent",
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  input: {
    minWidth: 140,
    borderWidth: 1,
    borderColor: theme.colors.text,
    borderRadius: 9999,
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
}));
