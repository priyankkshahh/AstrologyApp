import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchDashboardPreferences,
  updateDashboardPreferences,
} from '../../redux/slices/dashboardSlice';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import { spacing } from '../../styles/spacing';

const modules = [
  { id: 'astrology', name: 'Astrology', icon: '♈', color: '#FF6B6B' },
  { id: 'numerology', name: 'Numerology', icon: '7️⃣', color: '#4ECDC4' },
  { id: 'tarot', name: 'Tarot', icon: '🔮', color: '#9400D3' },
  { id: 'palmistry', name: 'Palmistry', icon: '🤚', color: '#FFD93D' },
];

const widgetOrderOptions = [
  'astrology',
  'insights',
  'numerology',
  'tarot',
  'palmistry',
];

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DashboardSettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { preferences, loading, error } = useAppSelector((state) => state.dashboard);

  const [localPreferences, setLocalPreferences] = React.useState({
    modules_enabled: preferences?.modules_enabled || ['astrology', 'numerology', 'tarot', 'palmistry'],
    widget_order: preferences?.widget_order || widgetOrderOptions,
    show_insights: preferences?.show_insights ?? true,
    daily_card_time: preferences?.daily_card_time || '09:00',
    weekly_read_day: preferences?.weekly_read_day || 'Monday',
  });

  useEffect(() => {
    dispatch(fetchDashboardPreferences());
  }, [dispatch]);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        modules_enabled: preferences.modules_enabled || ['astrology', 'numerology', 'tarot', 'palmistry'],
        widget_order: preferences.widget_order || widgetOrderOptions,
        show_insights: preferences.show_insights ?? true,
        daily_card_time: preferences.daily_card_time || '09:00',
        weekly_read_day: preferences.weekly_read_day || 'Monday',
      });
    }
  }, [preferences]);

  const handleToggleModule = (moduleId: string) => {
    const newModules = localPreferences.modules_enabled.includes(moduleId as any)
      ? localPreferences.modules_enabled.filter((m) => m !== moduleId)
      : [...localPreferences.modules_enabled, moduleId];

    setLocalPreferences({
      ...localPreferences,
      modules_enabled: newModules as any,
    });
  };

  const handleToggleInsights = () => {
    setLocalPreferences({
      ...localPreferences,
      show_insights: !localPreferences.show_insights,
    });
  };

  const handleSave = () => {
    dispatch(updateDashboardPreferences(localPreferences));
  };

  const handleReset = () => {
    setLocalPreferences({
      modules_enabled: ['astrology', 'numerology', 'tarot', 'palmistry'],
      widget_order: widgetOrderOptions,
      show_insights: true,
      daily_card_time: '09:00',
      weekly_read_day: 'Monday',
    });
  };

  if (loading && !preferences) {
    return <Loading message="Loading settings..." />;
  }

  return (
    <LinearGradient colors={colors.gradient.cosmic} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Dashboard Settings</Text>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Enabled Modules</Text>
          <Text style={styles.cardDescription}>
            Choose which divination modules appear on your dashboard
          </Text>

          {modules.map((module) => {
            const isEnabled = localPreferences.modules_enabled.includes(module.id as any);
            return (
              <TouchableOpacity
                key={module.id}
                style={[
                  styles.moduleItem,
                  !isEnabled && styles.moduleItemDisabled,
                ]}
                onPress={() => handleToggleModule(module.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.moduleIcon, { backgroundColor: isEnabled ? module.color : 'rgba(255, 255, 255, 0.1)' }]}>
                  <Text style={styles.iconText}>{module.icon}</Text>
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={[styles.moduleName, !isEnabled && styles.textDisabled]}>
                    {module.name}
                  </Text>
                  <Text style={styles.moduleStatus}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={() => handleToggleModule(module.id)}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: module.color }}
                  thumbColor={isEnabled ? colors.white : colors.text.secondary}
                />
              </TouchableOpacity>
            );
          })}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Display Preferences</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Show Cross-Module Insights</Text>
            <Text style={styles.settingDescription}>
              Display correlations between different divination systems
            </Text>
            <Switch
              value={localPreferences.show_insights}
              onValueChange={handleToggleInsights}
              trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: colors.cosmic.purple }}
              thumbColor={localPreferences.show_insights ? colors.white : colors.text.secondary}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Daily Card Time</Text>
            <Text style={styles.settingDescription}>
              Time when daily tarot card is drawn
            </Text>
            <Text style={styles.settingValue}>
              {localPreferences.daily_card_time}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Weekly Reading Day</Text>
            <Text style={styles.settingDescription}>
              Preferred day for weekly readings
            </Text>
            <View style={styles.daySelector}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    localPreferences.weekly_read_day === day && styles.dayButtonActive,
                  ]}
                  onPress={() =>
                    setLocalPreferences({ ...localPreferences, weekly_read_day: day })
                  }
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      localPreferences.weekly_read_day === day && styles.dayButtonTextActive,
                    ]}
                  >
                    {day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Widget Order</Text>
          <Text style={styles.cardDescription}>
            Drag to reorder dashboard widgets
          </Text>
          {localPreferences.widget_order.map((item, index) => {
            const module = modules.find((m) => m.id === item);
            return module ? (
              <View key={item} style={styles.widgetOrderItem}>
                <Text style={styles.orderNumber}>{index + 1}</Text>
                <View style={[styles.widgetDot, { backgroundColor: module.color }]} />
                <Text style={styles.widgetName}>{module.name}</Text>
                {item === 'insights' && (
                  <Text style={styles.widgetLabel}>Insights</Text>
                )}
              </View>
            ) : null;
          })}
        </Card>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset to Default</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: spacing.xxl * 2,
  },
  headerTitle: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  errorCard: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fonts.sizes.sm,
    color: colors.error,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  moduleItemDisabled: {
    opacity: 0.5,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
  moduleStatus: {
    fontSize: fonts.sizes.xs,
    color: colors.text.secondary,
  },
  settingItem: {
    paddingVertical: spacing.md,
  },
  settingLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  settingValue: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.cosmic.purple,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: spacing.md,
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  dayButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  dayButtonActive: {
    backgroundColor: colors.cosmic.purple,
  },
  dayButtonText: {
    fontSize: fonts.sizes.xs,
    color: colors.text.secondary,
  },
  dayButtonTextActive: {
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  widgetOrderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  orderNumber: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.text.secondary,
    width: 24,
    marginRight: spacing.md,
  },
  widgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  widgetName: {
    fontSize: fonts.sizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  widgetLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.cosmic.purple,
    marginLeft: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  resetButtonText: {
    fontSize: fonts.sizes.md,
    color: colors.text.secondary,
    fontWeight: fonts.weights.medium,
  },
  saveButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.cosmic.purple,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: fonts.sizes.md,
    color: colors.white,
    fontWeight: fonts.weights.semibold,
  },
});

export default DashboardSettingsScreen;
