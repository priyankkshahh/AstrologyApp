import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchDashboard } from '../../redux/slices/dashboardSlice';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

export const PalmistryDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, loading } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading && !data) {
    return <Loading message="Loading palmistry insights..." />;
  }

  const palmistry = data?.palmistry;

  const handleUploadPalm = useCallback(() => {
    // Navigate to palm upload screen (needs to be implemented)
    Alert.alert('Coming Soon', 'Palm photo upload will be available soon.');
  }, []);

  const handleViewPhotos = useCallback(async () => {
    try {
      const response = await api.getPalmPhotos();
      if (response.data.success) {
        // Navigate to photo gallery (needs to be implemented)
        Alert.alert('Photos', `You have ${response.data.data.length} palm photos.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch palm photos.');
    }
  }, []);

  if (!palmistry) {
    return (
      <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.noDataCard}>
            <Text style={styles.noDataIcon}>🤚</Text>
            <Text style={styles.noDataTitle}>No Palm Readings Yet</Text>
            <Text style={styles.noDataText}>
              Upload photos of your palms to receive AI-powered analysis of your lines, mounts, and personality traits.
            </Text>
            <Button title="Upload First Palm Photo" onPress={handleUploadPalm} />
          </Card>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>🤚 Palmistry</Text>

        <Card style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{palmistry.recentPhotosCount}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>

          {palmistry.lastReading && (
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statValue}>
                {new Date(palmistry.lastReading).toLocaleDateString()}
              </Text>
              <Text style={styles.statLabel}>Last Reading</Text>
            </View>
          )}
        </Card>

        {palmistry.personalityHighlight && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Personality Highlight</Text>
            <Text style={styles.cardText}>{palmistry.personalityHighlight}</Text>
          </Card>
        )}

        {palmistry.handShape && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Hand Shape</Text>
            <Text style={styles.cardText}>
              Your {palmistry.handShape} hand shape indicates specific personality traits and strengths.
            </Text>
          </Card>
        )}

        {palmistry.dominantHand && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Dominant Hand</Text>
            <Text style={styles.cardText}>
              {palmistry.dominantHand === 'right' ? 'Right' : 'Left'} handed
            </Text>
          </Card>
        )}

        <View style={styles.actionButtons}>
          <Button
            title="Upload New Photo"
            onPress={handleUploadPalm}
            style={[styles.button, styles.uploadButton]}
          />
          <Button
            title="View All Photos"
            onPress={handleViewPhotos}
            style={styles.button}
            variant="outline"
          />
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Palmistry</Text>
          <Text style={styles.infoText}>
            Palmistry reveals insights about your character, life path, and potential through analysis 
            of palm lines, mounts, finger shapes, and hand features. Our AI-powered system 
            provides detailed interpretations based on traditional palmistry wisdom.
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
  statsCard: {
    flexDirection: 'row',
    padding: spacing.xl,
    marginBottom: spacing.md,
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
  },
  statLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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
  actionButtons: {
    marginBottom: spacing.lg,
  },
  button: {
    marginBottom: spacing.sm,
  },
  uploadButton: {
    backgroundColor: colors.cosmic.purple,
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
  noDataIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
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
    marginBottom: spacing.lg,
    lineHeight: fonts.lineHeights.relaxed * fonts.sizes.md,
  },
});

export default PalmistryDashboardScreen;
