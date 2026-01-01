import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import RootNavigator from './src/components/navigation/RootNavigator';
import { getAuthData } from './src/services/auth';
import { setUser } from './src/redux/slices/authSlice';

const AppContent: React.FC = () => {
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const authData = await getAuthData();
        if (authData.accessToken && authData.user) {
          store.dispatch(setUser({
            user: authData.user,
            profile: authData.profile,
            accessToken: authData.accessToken,
          }));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      }
    };

    loadAuthData();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
