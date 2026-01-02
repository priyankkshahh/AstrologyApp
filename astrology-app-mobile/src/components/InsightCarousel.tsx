import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../styles/colors';
import fonts from '../styles/fonts';
import { spacing } from '../styles/spacing';
import type { CrossModuleInsight } from '../types';

interface InsightCarouselProps {
  insights: CrossModuleInsight[];
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.lg * 2;
const CARD_MARGIN = spacing.md;

const categoryConfig = {
  harmonious: {
    colors: ['#4ECDC4', '#7EDCD6'],
    icon: '✨',
  },
  challenging: {
    colors: ['#FF6B6B', '#FF8E8E'],
    icon: '⚡',
  },
  opportunities: {
    colors: ['#FFD93D', '#FFE570'],
    icon: '🌟',
  },
  warnings: {
    colors: ['#9400D3', '#B84CE8'],
    icon: '⚠️',
  },
};

export const InsightCarousel: React.FC<InsightCarouselProps> = ({ insights }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (insights.length === 0) {
    return null;
  }

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + CARD_MARGIN));
    setActiveIndex(index);
  };

  const renderInsight = (insight: CrossModuleInsight, index: number) => {
    const config = categoryConfig[insight.category];
    const strengthColor = {
      high: colors.cosmic.green,
      medium: colors.cosmic.yellow,
      low: colors.text.tertiary,
    }[insight.strength];

    return (
      <View
        key={insight.id}
        style={[
          styles.insightCard,
          { width: CARD_WIDTH, marginRight: CARD_MARGIN },
        ]}
      >
        <LinearGradient
          colors={config.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.insightGradient}
        >
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>{config.icon}</Text>
            <View style={styles.strengthBadge}>
              <Text style={[styles.strengthText, { color: strengthColor }]}>
                {insight.strength.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.insightTitle} numberOfLines={2}>
            {insight.title}
          </Text>

          <Text style={styles.insightDescription} numberOfLines={3}>
            {insight.description}
          </Text>

          <View style={styles.moduleTags}>
            {insight.modules.map((module) => (
              <View key={module} style={styles.moduleTag}>
                <Text style={styles.moduleTagText}>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cross-Module Insights</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {insights.map((insight, index) => renderInsight(insight, index))}
      </ScrollView>

      <View style={styles.pagination}>
        {insights.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  insightCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  insightGradient: {
    padding: spacing.lg,
    minHeight: 180,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightIcon: {
    fontSize: 24,
  },
  strengthBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  strengthText: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
  },
  insightTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  insightDescription: {
    fontSize: fonts.sizes.md,
    color: colors.white,
    lineHeight: fonts.lineHeights.relaxed * fonts.sizes.md,
    marginBottom: spacing.md,
  },
  moduleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moduleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  moduleTagText: {
    fontSize: fonts.sizes.xs,
    color: colors.white,
    fontWeight: fonts.weights.medium,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.cosmic.purple,
    width: 24,
  },
});

export default InsightCarousel;
