import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Navbar from './Navbar';
import Login from '../../screens/Login';
import Signup from '../../screens/Signup';
import MyNetwork from '../../screens/MyNetwork';

export type DrawerParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  MyNetwork: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
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
