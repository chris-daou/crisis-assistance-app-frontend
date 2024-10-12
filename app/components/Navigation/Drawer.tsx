import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Navbar from './Navbar';
import Login from '../../screens/Login';

export type DrawerParamList = {
  Home: undefined;
  Login: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false, // Hides the header on all screens
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
    </Drawer.Navigator>
  );
}
