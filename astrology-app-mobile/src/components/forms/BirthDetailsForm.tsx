import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';

export const BirthDetailsForm: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Birth Details Form Component</Text>
      <Text style={styles.subtext}>
        This component will collect date of birth, birth time, and birth location
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  text: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtext: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
  },
});

export default BirthDetailsForm;
