import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchReadingsSummary } from '../../redux/slices/dashboardSlice';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';
import type { ReadingSummaryItem } from '../../types';

const moduleConfig = {
  astrology: { icon: '♈', color: '#FF6B6B' },
  numerology: { icon: '7️⃣', color: '#4ECDC4' },
  tarot: { icon: '🔮', color: '#9400D3' },
  palmistry: { icon: '🤚', color: '#FFD93D' },
};

type FilterType = 'all' | 'astrology' | 'numerology' | 'tarot' | 'palmistry';

export const ReadingsHistoryScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { readingsSummary, loading } = useAppSelector((state) => state.dashboard);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (filter === 'all') {
      dispatch(fetchReadingsSummary({ limit: 50 }));
    } else {
      dispatch(fetchReadingsSummary({ limit: 50, module: filter }));
    }
  }, [dispatch, filter]);

  const filteredReadings = readingsSummary?.recent_readings || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const renderFilterButton = (filterType: FilterType, label: string, icon?: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.activeFilter]}
      onPress={() => setFilter(filterType)}
    >
      {icon && <Text style={styles.filterIcon}>{icon}</Text>}
      <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !readingsSummary) {
    return <Loading message="Loading reading history..." />;
  }

  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Readings History</Text>

        {readingsSummary && (
          <Card style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{readingsSummary.total_readings}</Text>
                <Text style={styles.statLabel}>Total Readings</Text>
              </View>

              {readingsSummary.streak_days !== undefined && (
                <View style={[styles.statItem, styles.statDivider]}>
                  <Text style={styles.statValue}>{readingsSummary.streak_days}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              )}

              {readingsSummary.most_frequent_module && (
                <View style={[styles.statItem, styles.statDivider]}>
                  <Text style={styles.statValue}>
                    {moduleConfig[readingsSummary.most_frequent_module as keyof typeof moduleConfig]?.icon || '📊'}
                  </Text>
                  <Text style={styles.statLabel}>Favorite</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {renderFilterButton('all', 'All')}
          {renderFilterButton('astrology', 'Astrology', '♈')}
          {renderFilterButton('numerology', 'Numerology', '7️⃣')}
          {renderFilterButton('tarot', 'Tarot', '🔮')}
          {renderFilterButton('palmistry', 'Palmistry', '🤚')}
        </ScrollView>

        {filteredReadings.length > 0 ? (
          filteredReadings.map((reading) => {
            const config = moduleConfig[reading.type as keyof typeof moduleConfig];
            return (
              <Card key={reading.id} style={styles.readingCard}>
                <View style={styles.readingHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: config.color }]}>
                    <Text style={styles.readingIcon}>{config.icon}</Text>
                  </View>
                  <View style={styles.readingMeta}>
                    <Text style={styles.readingType}>
                      {reading.type.charAt(0).toUpperCase() + reading.type.slice(1)}
                    </Text>
                    <Text style={styles.readingDate}>{formatDate(reading.date)}</Text>
                  </View>
                </View>
                {reading.preview && (
                  <Text style={styles.readingPreview} numberOfLines={2}>
                    {reading.preview}
                  </Text>
                )}
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No readings found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'Start exploring to build your reading history.'
                : `No ${filter} readings yet.`
              }
            </Text>
          </Card>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  statsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
  },
  filtersContainer: {
    marginBottom: spacing.lg,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: spacing.sm,
  },
  activeFilter: {
    backgroundColor: colors.cosmic.purple,
  },
  filterIcon: {
    fontSize: fonts.sizes.md,
    marginRight: spacing.xs,
  },
  filterText: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
    fontWeight: fonts.weights.medium,
  },
  activeFilterText: {
    color: colors.white,
  },
  readingCard: {
    marginBottom: spacing.md,
  },
  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  readingIcon: {
    fontSize: 20,
  },
  readingMeta: {
    flex: 1,
  },
  readingType: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
  },
  readingDate: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  readingPreview: {
    fontSize: fonts.sizes.sm,
    color: colors.text.tertiary,
    lineHeight: fonts.lineHeights.compressed * fonts.sizes.sm,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default ReadingsHistoryScreen;
