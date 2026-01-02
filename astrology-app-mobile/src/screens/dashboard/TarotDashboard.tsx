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

export const TarotDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading && !data) {
    return <Loading message="Loading tarot insights..." />;
  }

  const tarot = data?.tarot;

  if (!tarot) {
    return (
      <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.noDataCard}>
            <Text style={styles.noDataTitle}>No Tarot Data</Text>
            <Text style={styles.noDataText}>
              Draw your first card to receive daily tarot guidance.
            </Text>
          </Card>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>🔮 Tarot</Text>

        <Card style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{tarot.dailyCard.name}</Text>
            <View style={[
              styles.orientationBadge, 
              tarot.orientation === 'reversed' && styles.reversed
            ]}>
              <Text style={styles.orientationText}>
                {tarot.orientation === 'upright' ? 'Upright' : 'Reversed'}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Interpretation</Text>
          <Text style={styles.cardText}>{tarot.dailyCard.interpretation}</Text>
        </Card>

        {tarot.dailyCard.keywords && tarot.dailyCard.keywords.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Keywords</Text>
            <View style={styles.keywordsContainer}>
              {tarot.dailyCard.keywords.map((keyword, index) => (
                <View key={index} style={styles.keywordBadge}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Today's Card</Text>
          <Text style={styles.infoText}>
            {tarot.orientation === 'upright' 
              ? `This card appears upright, indicating positive manifestation of its energies. 
                 Embrace the {tarot.dailyCard.name}'s qualities today.`
              : `This card appears reversed, suggesting inner work or challenges to overcome. 
                 The reversed ${tarot.dailyCard.name} invites reflection and growth.`
            }
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
  cardHeader: {
    alignItems: 'center',
  },
  cardName: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  orientationBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.cosmic.green,
  },
  reversed: {
    backgroundColor: colors.cosmic.red,
  },
  orientationText: {
    fontSize: fonts.sizes.sm,
    color: colors.white,
    fontWeight: fonts.weights.bold,
    textTransform: 'uppercase',
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
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  keywordText: {
    fontSize: fonts.sizes.md,
    color: colors.text.primary,
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

export default TarotDashboardScreen;
