import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchDashboard,
  fetchQuickCards,
  refreshDashboard,
  clearError,
} from '../../redux/slices/dashboardSlice';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';
import DashboardWidget from '../../components/DashboardWidget';
import QuickInsightCard from '../../components/QuickInsightCard';
import DashboardHeader from '../../components/DashboardHeader';
import InsightCarousel from '../../components/InsightCarousel';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { data, insights, quickCards, preferences, loading, error, lastFetch } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchQuickCards(5));
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(refreshDashboard());
  }, [dispatch]);

  const handleWidgetPress = useCallback((module: string) => {
    switch (module) {
      case 'astrology':
        navigation.navigate('AstrologyDashboard');
        break;
      case 'numerology':
        navigation.navigate('NumerologyDashboard');
        break;
      case 'tarot':
        navigation.navigate('TarotDashboard');
        break;
      case 'palmistry':
        navigation.navigate('PalmistryDashboard');
        break;
      default:
        break;
    }
  }, [navigation]);

  if (loading && !data) {
    return <Loading message="Loading your cosmic dashboard..." />;
  }

  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={colors.text.primary}
            colors={[colors.text.primary]}
          />
        }
      >
        <DashboardHeader userName={data?.user.name || 'Seeker'} date={data?.date || ''} />

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {preferences?.show_insights && insights.length > 0 && (
          <InsightCarousel insights={insights} />
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Insights</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ReadingsHistory')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {quickCards.length > 0 ? (
            <View style={styles.quickCardsContainer}>
              {quickCards.map((card) => (
                <QuickInsightCard
                  key={card.id}
                  card={card}
                  onPress={() => handleWidgetPress(card.module)}
                />
              ))}
            </View>
          ) : (
            <Card style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>
                No insights available yet. Complete your first reading to get started!
              </Text>
            </Card>
          )}
        </View>

        {preferences?.modules_enabled.map((module) => {
          const moduleData = data?.[module as keyof typeof data];
          if (!moduleData) return null;

          return (
            <DashboardWidget
              key={module}
              module={module as any}
              data={moduleData}
              onPress={() => handleWidgetPress(module)}
            />
          );
        })}

        <Card style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Customize Your Dashboard</Text>
          <Text style={styles.settingsText}>
            Choose which modules to display and arrange them your way.
          </Text>
          <Button
            title="Dashboard Settings"
            onPress={() => navigation.navigate('DashboardSettings')}
            style={styles.settingsButton}
          />
        </Card>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  errorCard: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fonts.sizes.sm,
    color: colors.error,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: fonts.sizes.md,
    color: colors.cosmic.purple,
    fontWeight: fonts.weights.medium,
  },
  quickCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  settingsCard: {
    marginTop: spacing.xl,
  },
  settingsTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  settingsText: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: fonts.lineHeights.relaxed * fonts.sizes.md,
  },
  settingsButton: {
    marginTop: spacing.sm,
  },
});

export default DashboardScreen;
