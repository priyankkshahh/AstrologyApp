import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <LinearGradient
      colors={colors.gradient.cosmic}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Holistic Divination</Text>
        <Text style={styles.subtitle}>
          Discover the mysteries of Astrology, Numerology, Tarot, and Palmistry
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>✨ Personalized Birth Charts</Text>
          <Text style={styles.feature}>🔮 Daily Tarot Readings</Text>
          <Text style={styles.feature}>📊 Numerology Insights</Text>
          <Text style={styles.feature}>🤚 AI Palm Analysis</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Signup')}
          size="large"
          style={styles.button}
        />
        <Button
          title="I already have an account"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          size="large"
          style={styles.button}
        />
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
    fontSize: fonts.sizes.huge,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fonts.sizes.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  features: {
    alignItems: 'flex-start',
  },
  feature: {
    fontSize: fonts.sizes.md,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: spacing.md,
  },
});

export default WelcomeScreen;
