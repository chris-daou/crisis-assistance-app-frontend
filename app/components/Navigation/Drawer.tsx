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
        
        drawerPosition: 'right', // Position the drawer to the right
        headerShown: false,
        swipeEnabled: false, // Disable swipe gesture to open the drawer
        drawerType: 'front', // Use front drawer type
        drawerActiveBackgroundColor: '#EBEBEB', // Active item background color
        drawerActiveTintColor: '#000', // Active item color
        drawerInactiveTintColor:'gray',
        drawerStyle: {
          backgroundColor: '#EBEBEB', // Drawer background color
          borderTopLeftRadius: 20,   // Round top-left corner
          borderBottomLeftRadius: 20, // Round bottom-left corner
          borderTopRightRadius: 20,   // Keep top-right corner sharp
          borderBottomRightRadius: 20, // Keep bottom-right corner sharp
          transform: [{ translateX: 700,  }], // Move the drawer far off-screen (adjust as needed)
          bottom: 65, // Align to the bottom
          top: 30,
          width:'50%',
        },
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
