import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

export default function GenreChip({ label, selected, onPress, icon }) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.chipActive : theme.chip,
          borderColor: selected ? theme.chipActive : theme.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? theme.primaryText : theme.text }]}>
        {icon ? `${icon} ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  label: { fontSize: 13.5, fontWeight: '600' },
});
