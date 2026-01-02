import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchDashboard } from '../../redux/slices/dashboardSlice';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';

export const NumerologyDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading && !data) {
    return <Loading message="Loading numerology insights..." />;
  }

  const numerology = data?.numerology;

  if (!numerology) {
    return (
      <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.noDataCard}>
            <Text style={styles.noDataTitle}>No Numerology Data</Text>
            <Text style={styles.noDataText}>
              Complete your profile to receive personalized numerology readings.
            </Text>
          </Card>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>7️⃣ Numerology</Text>

        <Card style={styles.mainCard}>
          <Text style={styles.dayNumber}>Day Number {numerology.dailyNumber}</Text>
          {numerology.lifePathNumber && (
            <Text style={styles.lifePath}>Life Path: {numerology.lifePathNumber}</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Daily Message</Text>
          <Text style={styles.cardText}>{numerology.numerologyMessage}</Text>
        </Card>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 1 }]}>
            <Text style={styles.statLabel}>Lucky Color</Text>
            <View style={[styles.colorPreview, { backgroundColor: numerology.luckyColor }]} />
          </Card>

          {numerology.favorableTime && (
            <Card style={[styles.statCard, { flex: 1 }]}>
              <Text style={styles.statLabel}>Best Time</Text>
              <Text style={styles.statValue}>{numerology.favorableTime}</Text>
            </Card>
          )}
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Numerology</Text>
          <Text style={styles.infoText}>
            Numerology reveals the hidden meanings of numbers in your life. 
            Your daily number {numerology.dailyNumber} influences your experiences today.
            {numerology.lifePathNumber && ` Your life path number ${numerology.lifePathNumber} represents your core personality and purpose.`}
          </Text>
        </Card>
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
  mainCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  dayNumber: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
  },
  lifePath: {
    fontSize: fonts.sizes.lg,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    lineHeight: fonts.lineHeights.relaxed * fonts.sizes.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    alignItems: 'center',
    padding: spacing.md,
  },
  statLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
  },
  colorPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: spacing.sm,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    lineHeight: fonts.lineHeights.relaxed * fonts.sizes.md,
  },
  noDataCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  noDataTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  noDataText: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default NumerologyDashboardScreen;
