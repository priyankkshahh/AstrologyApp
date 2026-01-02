import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootStackParamList } from '../../types';
import { useAppSelector } from '../../redux/hooks';

// Auth Screens
import WelcomeScreen from '../../screens/onboarding/WelcomeScreen';
import LoginScreen from '../../screens/auth/LoginScreen';
import SignupScreen from '../../screens/auth/SignupScreen';

// Dashboard Screens
import HomeScreen from '../../screens/home/HomeScreen';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import AstrologyDashboardScreen from '../../screens/dashboard/AstrologyDashboard';
import NumerologyDashboardScreen from '../../screens/dashboard/NumerologyDashboard';
import TarotDashboardScreen from '../../screens/dashboard/TarotDashboard';
import PalmistryDashboardScreen from '../../screens/dashboard/PalmistryDashboard';
import ReadingsHistoryScreen from '../../screens/dashboard/ReadingsHistoryScreen';
import DashboardSettingsScreen from '../../screens/dashboard/DashboardSettingsScreen';

import colors from '../../styles/colors';
import fonts from '../../styles/fonts';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={() => ({
        tabBarActiveTintColor: colors.cosmic.purple,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: fonts.sizes.xs,
          fontWeight: fonts.weights.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 22, color }}>
              {focused ? '🏠' : '🏠'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Astrology"
        component={AstrologyDashboardScreen}
        options={{
          tabBarLabel: 'Astrology',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 22, color }}>
              {focused ? '♈' : '♈'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Numerology"
        component={NumerologyDashboardScreen}
        options={{
          tabBarLabel: 'Numerology',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 22, color }}>
              {focused ? '7️⃣' : '7️⃣'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Tarot"
        component={TarotDashboardScreen}
        options={{
          tabBarLabel: 'Tarot',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 22, color }}>
              {focused ? '🔮' : '🔮'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Palmistry"
        component={PalmistryDashboardScreen}
        options={{
          tabBarLabel: 'Palmistry',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 22, color }}>
              {focused ? '🤚' : '🤚'}
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen 
              name="ReadingsHistory" 
              component={ReadingsHistoryScreen}
              options={{
                presentation: 'card',
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.background.card,
                },
                headerTintColor: colors.text.primary,
              }}
            />
            <Stack.Screen
              name="DashboardSettings"
              component={DashboardSettingsScreen}
              options={{
                presentation: 'card',
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.background.card,
                },
                headerTintColor: colors.text.primary,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
