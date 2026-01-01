import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';
import Button from '../../components/common/Button';

export const SocialAuthScreen: React.FC = () => {
  const handleGoogleSignIn = () => {
    console.log('Google Sign In - To be implemented');
  };

  const handleAppleSignIn = () => {
    console.log('Apple Sign In - To be implemented');
  };

  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Social Authentication</Text>
        <Text style={styles.subtitle}>Sign in with your preferred method</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="secondary"
            size="large"
            style={styles.button}
          />
          <Button
            title="Continue with Apple"
            onPress={handleAppleSignIn}
            variant="secondary"
            size="large"
            style={styles.button}
          />
        </View>
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
  },
  title: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: spacing.md,
  },
});

export default SocialAuthScreen;
