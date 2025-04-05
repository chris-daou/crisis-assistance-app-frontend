// AuthNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../../screens/auth/Login';
import Signup from '../../screens/auth/Signup';
import OtpScreen from '../../screens/auth/Otp';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Otp: { phone: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Otp" component={OtpScreen} />
    </Stack.Navigator>
  );
}
