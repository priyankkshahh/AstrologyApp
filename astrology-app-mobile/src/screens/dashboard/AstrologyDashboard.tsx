import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchDashboard } from '../../redux/slices/dashboardSlice';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';

export const AstrologyDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading && !data) {
    return <Loading message="Loading astrology insights..." />;
  }

  const astrology = data?.astrology;

  if (!astrology) {
    return (
      <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.noDataCard}>
            <Text style={styles.noDataTitle}>No Astrology Data</Text>
            <Text style={styles.noDataText}>
              Complete your profile with birth details to receive personalized astrology readings.
            </Text>
          </Card>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>♈ Astrology</Text>

        <Card style={styles.mainCard}>
          <Text style={styles.sunSign}>{astrology.sunSign}</Text>
          <Text style={styles.subText}>{astrology.moonPhase}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Daily Horoscope</Text>
          <Text style={styles.cardText}>{astrology.todayHoroscope}</Text>
        </Card>

        <View style={styles.statsRow}>
          {astrology.dominantPlanet && (
            <Card style={[styles.statCard, { flex: 1 }]}>
              <Text style={styles.statLabel}>Dominant Planet</Text>
              <Text style={styles.statValue}>{astrology.dominantPlanet}</Text>
            </Card>
          )}

          {astrology.luckyNumber && (
            <Card style={[styles.statCard, { flex: 1 }]}>
              <Text style={styles.statLabel}>Lucky Number</Text>
              <Text style={styles.statValue}>{astrology.luckyNumber}</Text>
            </Card>
          )}
        </View>

        {astrology.luckyColor && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Lucky Color</Text>
            <View style={[styles.colorPreview, { backgroundColor: astrology.luckyColor }]} />
          </Card>
        )}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Your Sign</Text>
          <Text style={styles.infoText}>
            Your {astrology.sunSign} energy influences how you express yourself and navigate the world. 
            Understanding your sun sign can help you make decisions aligned with your true nature.
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
  sunSign: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
  },
  subText: {
    fontSize: fonts.sizes.md,
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
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
  },
  colorPreview: {
    width: '100%',
    height: 40,
    borderRadius: 8,
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

export default AstrologyDashboardScreen;
