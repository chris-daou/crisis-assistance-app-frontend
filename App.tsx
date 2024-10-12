import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './app/components/Navigation/Drawer';

export default function App() {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}
