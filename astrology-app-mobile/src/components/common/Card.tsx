import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import colors from '../../styles/colors';
import { borderRadius, spacing, shadows } from '../../styles/spacing';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.card.border,
    ...shadows.md,
  },
});

export default Card;
