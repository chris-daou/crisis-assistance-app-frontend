// RootNavigator.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading]   = useState(true);

  // Build the context value with your existing AuthContext shape
  const authContextValue = useMemo(() => ({
    isLoggedIn,
    login: () => {
      setIsLoggedIn(true);
    },
    logout: () => {
      // fire-and-forget deletes—context.logout stays synchronous
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
      setIsLoggedIn(false);
    }
  }), [isLoggedIn]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '');
        const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '');
        console.log('Token:', token);
        console.log('User ID:', userId);

        if (token && userId) {
          const response = await api.get('auth/authotest', {
            headers: { 'user-id': userId, Authorization: `Bearer ${token}` }
          });
          console .log('Auth response:', response.data);
          await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
          setIsLoggedIn(response.status === 200);
        }
      } catch (err) {
        console.error('Auth bootstrap failed', err);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  // Block everything with a full-screen spinner while verifying
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
