import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './common/Card';
import colors from '../styles/colors';
import fonts from '../styles/fonts';
import { spacing } from '../styles/spacing';
import type { QuickCard } from '../types';

interface QuickInsightCardProps {
  card: QuickCard;
  onPress: () => void;
}

const moduleConfig = {
  astrology: { icon: '♈', color: '#FF6B6B' },
  numerology: { icon: '7️⃣', color: '#4ECDC4' },
  tarot: { icon: '🔮', color: '#9400D3' },
  palmistry: { icon: '🤚', color: '#FFD93D' },
};

export const QuickInsightCard: React.FC<QuickInsightCardProps> = ({ card, onPress }) => {
  const config = moduleConfig[card.module];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <Card style={[styles.card, { borderTopColor: config.color, borderTopWidth: 3 }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {card.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {card.subtitle}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.md,
    minHeight: 120,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
    lineHeight: fonts.lineHeights.compressed * fonts.sizes.sm,
  },
});

export default QuickInsightCard;
