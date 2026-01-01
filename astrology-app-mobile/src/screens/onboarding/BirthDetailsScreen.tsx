import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';

export const BirthDetailsScreen: React.FC = () => {
  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Birth Details</Text>
        <Text style={styles.subtitle}>
          This screen will collect birth date, time, and place for astrological calculations
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default BirthDetailsScreen;
