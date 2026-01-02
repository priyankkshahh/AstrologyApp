import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './common/Card';
import colors from '../styles/colors';
import fonts from '../styles/fonts';
import { spacing } from '../styles/spacing';
import type { AstrologyWidgetData, NumerologyWidgetData, TarotWidgetData, PalmistryWidgetData } from '../types';

interface DashboardWidgetProps {
  module: 'astrology' | 'numerology' | 'tarot' | 'palmistry';
  data: AstrologyWidgetData | NumerologyWidgetData | TarotWidgetData | PalmistryWidgetData;
  onPress: () => void;
}

const moduleConfig = {
  astrology: {
    icon: '♈',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E'],
    title: 'Astrology',
  },
  numerology: {
    icon: '7️⃣',
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#7EDCD6'],
    title: 'Numerology',
  },
  tarot: {
    icon: '🔮',
    color: '#9400D3',
    gradient: ['#9400D3', '#B84CE8'],
    title: 'Tarot',
  },
  palmistry: {
    icon: '🤚',
    color: '#FFD93D',
    gradient: ['#FFD93D', '#FFE570'],
    title: 'Palmistry',
  },
};

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ module, data, onPress }) => {
  const config = moduleConfig[module];

  const renderContent = () => {
    switch (module) {
      case 'astrology':
        return renderAstrologyContent(data as AstrologyWidgetData);
      case 'numerology':
        return renderNumerologyContent(data as NumerologyWidgetData);
      case 'tarot':
        return renderTarotContent(data as TarotWidgetData);
      case 'palmistry':
        return renderPalmistryContent(data as PalmistryWidgetData);
      default:
        return null;
    }
  };

  const renderAstrologyContent = (astrologyData: AstrologyWidgetData) => (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>{astrologyData.sunSign}</Text>
        <Text style={styles.widgetSubtitle}>{astrologyData.moonPhase}</Text>
      </View>
      <Text style={styles.previewText} numberOfLines={2}>
        {astrologyData.todayHoroscope}
      </Text>
      <View style={styles.metadataRow}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Dominant Planet</Text>
          <Text style={styles.metadataValue}>{astrologyData.dominantPlanet}</Text>
        </View>
        {astrologyData.luckyNumber && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Lucky Number</Text>
            <Text style={styles.metadataValue}>{astrologyData.luckyNumber}</Text>
          </View>
        )}
      </View>
    </>
  );

  const renderNumerologyContent = (numerologyData: NumerologyWidgetData) => (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>Day Number {numerologyData.dailyNumber}</Text>
        <Text style={styles.widgetSubtitle}>Life Path {numerologyData.lifePathNumber}</Text>
      </View>
      <Text style={styles.previewText} numberOfLines={2}>
        {numerologyData.numerologyMessage}
      </Text>
      <View style={styles.metadataRow}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Lucky Color</Text>
          <View style={[styles.colorDot, { backgroundColor: numerologyData.luckyColor }]} />
        </View>
        {numerologyData.favorableTime && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Best Time</Text>
            <Text style={styles.metadataValue}>{numerologyData.favorableTime}</Text>
          </View>
        )}
      </View>
    </>
  );

  const renderTarotContent = (tarotData: TarotWidgetData) => (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>{tarotData.dailyCard.name}</Text>
        <View style={[styles.orientationBadge, tarotData.orientation === 'reversed' && styles.reversed]}>
          <Text style={styles.orientationText}>
            {tarotData.orientation === 'upright' ? '↑' : '↓'}
          </Text>
        </View>
      </View>
      <Text style={styles.previewText} numberOfLines={2}>
        {tarotData.dailyCard.interpretation}
      </Text>
      {tarotData.dailyCard.keywords && tarotData.dailyCard.keywords.length > 0 && (
        <View style={styles.keywordsRow}>
          {tarotData.dailyCard.keywords.slice(0, 3).map((keyword, index) => (
            <View key={index} style={styles.keywordBadge}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );

  const renderPalmistryContent = (palmistryData: PalmistryWidgetData) => (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>
          {palmistryData.recentPhotosCount} Reading{palmistryData.recentPhotosCount !== 1 ? 's' : ''}
        </Text>
        {palmistryData.lastReading && (
          <Text style={styles.widgetSubtitle}>
            Last: {new Date(palmistryData.lastReading).toLocaleDateString()}
          </Text>
        )}
      </View>
      {palmistryData.personalityHighlight ? (
        <Text style={styles.previewText} numberOfLines={2}>
          {palmistryData.personalityHighlight}
        </Text>
      ) : (
        <Text style={styles.previewText} numberOfLines={2}>
          Upload your palm photos to receive personalized insights about your life path, career, and relationships.
        </Text>
      )}
      <View style={styles.metadataRow}>
        {palmistryData.handShape && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Hand Shape</Text>
            <Text style={styles.metadataValue}>{palmistryData.handShape}</Text>
          </View>
        )}
        {palmistryData.dominantHand && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Dominant</Text>
            <Text style={styles.metadataValue}>{palmistryData.dominantHand}</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.container, { borderLeftColor: config.color, borderLeftWidth: 4 }]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>
          <View style={styles.widgetContent}>{renderContent()}</View>
          <Text style={styles.viewMoreText}>View More →</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'column',
  },
  iconContainer: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  widgetContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  widgetTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  widgetSubtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
  },
  previewText: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    lineHeight: fonts.lineHeights.relaxed * fonts.sizes.md,
    marginBottom: spacing.sm,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metadataItem: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  metadataValue: {
    fontSize: fonts.sizes.sm,
    color: colors.text.primary,
    fontWeight: fonts.weights.medium,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  orientationBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.cosmic.green,
  },
  reversed: {
    backgroundColor: colors.cosmic.red,
  },
  orientationText: {
    fontSize: fonts.sizes.xs,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  keywordBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  keywordText: {
    fontSize: fonts.sizes.xs,
    color: colors.text.secondary,
  },
  viewMoreText: {
    fontSize: fonts.sizes.sm,
    color: colors.cosmic.purple,
    fontWeight: fonts.weights.semibold,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
});

export default DashboardWidget;
