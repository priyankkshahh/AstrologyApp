import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchProfile } from '../../redux/slices/authSlice';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';

// This is now a simplified landing screen - DashboardScreen is the new main home
export const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, profile, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{profile?.full_name || 'Seeker'}</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>✨ Your Cosmic Journey</Text>
          <Text style={styles.cardText}>
            Explore the mysteries of the universe through personalized readings across astrology, numerology, tarot, and palmistry.
          </Text>
        </Card>

        <View style={styles.grid}>
          <Card style={styles.gridCard}>
            <Text style={styles.cardEmoji}>♈</Text>
            <Text style={styles.gridTitle}>Astrology</Text>
            <Text style={styles.gridSubtitle}>Birth Chart</Text>
          </Card>

          <Card style={styles.gridCard}>
            <Text style={styles.cardEmoji}>🔮</Text>
            <Text style={styles.gridTitle}>Tarot</Text>
            <Text style={styles.gridSubtitle}>Daily Reading</Text>
          </Card>

          <Card style={styles.gridCard}>
            <Text style={styles.cardEmoji}>7️⃣</Text>
            <Text style={styles.gridTitle}>Numerology</Text>
            <Text style={styles.gridSubtitle}>Life Path</Text>
          </Card>

          <Card style={styles.gridCard}>
            <Text style={styles.cardEmoji}>🤚</Text>
            <Text style={styles.gridTitle}>Palmistry</Text>
            <Text style={styles.gridSubtitle}>Palm Reading</Text>
          </Card>
        </View>

        {!profile?.profile_completed && (
          <Card style={styles.onboardingCard}>
            <Text style={styles.onboardingTitle}>Complete Your Profile</Text>
            <Text style={styles.onboardingText}>
              Add your birth details for personalized readings
            </Text>
            <Button title="Complete Profile" onPress={() => {}} />
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
  scrollContent: {
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
  },
  name: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    lineHeight: fonts.lineHeights.relaxed * fonts.sizes.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  gridCard: {
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  gridTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  gridSubtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
  },
  onboardingCard: {
    backgroundColor: colors.cosmic.purple,
  },
  onboardingTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  onboardingText: {
    fontSize: fonts.sizes.md,
    color: colors.white,
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
