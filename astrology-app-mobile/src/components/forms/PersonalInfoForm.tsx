import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';

export const PersonalInfoForm: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Personal Info Form Component</Text>
      <Text style={styles.subtext}>
        This component will collect user's personal information like name, gender, etc.
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

export default PersonalInfoForm;
