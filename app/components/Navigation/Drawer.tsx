import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Navbar from './Navbar';
import Login from '../../screens/Login';
import Signup from '../../screens/Signup';
import MyNetwork from '../../screens/MyNetwork';
import OtpScreen from '../../screens/Otp';

export type RootStackParamList = {
  Drawer: undefined;
  Otp: { phone: string };
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

// Drawer Navigator (UI)
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false,
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={Navbar} 
        options={{ drawerLabel: 'Home' }} 
      />
      <Drawer.Screen 
        name="Login" 
        component={Login} 
        options={{ drawerLabel: 'Login' }} 
      />
      <Drawer.Screen 
        name="Signup" 
        component={Signup} 
        options={{ drawerLabel: 'Signup' }}
      />
      <Drawer.Screen 
        name="MyNetwork" 
        component={MyNetwork} 
        options={{ drawerLabel: 'My Network' }}
      />
    </Drawer.Navigator>
  );
}

// Root Stack Navigator
export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Drawer UI */}
      <Stack.Screen name="Drawer" component={DrawerNavigator} />

      {/* Hidden OTP Screen */}
      <Stack.Screen name="Otp" component={OtpScreen} />
    </Stack.Navigator>
  );
}
