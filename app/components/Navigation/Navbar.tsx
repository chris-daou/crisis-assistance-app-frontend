import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../../screens/Map';
import AssistantScreen from '../../screens/Assistant';
import NewsScreen from '../../screens/News';
import VolunteersScreen from '../../screens/Volunteers';
import { Button, SafeAreaView, StyleSheet } from 'react-native'; // Import Button and SafeAreaView
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { DrawerNavigationProp } from '@react-navigation/drawer'; // Import DrawerNavigationProp
import { DrawerParamList } from './Drawer'; // Type for Drawer

type TabParamList = {
  Map: undefined;
  Assistant: undefined;
  News: undefined;
  Volunteers: undefined;
};

// Assign type for the bottom tab navigator
const Tab = createBottomTabNavigator<TabParamList>();

export default function BottomTabNavigator() {
  // Correctly type the navigation hook to access drawer-related methods
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <>
      {/* Custom header with SafeAreaView to avoid overlapping with status bar */}
      <SafeAreaView>
        <Button title="Menu" onPress={() => navigation.toggleDrawer()} />
      </SafeAreaView>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: 'red', paddingBottom: 5, paddingTop: 5, height: 60 },
        }}
      >
        <Tab.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ tabBarLabel: 'Map', headerShown: false }} 
        />
        <Tab.Screen 
          name="Assistant" 
          component={AssistantScreen} 
          options={{ tabBarLabel: 'Assistant', headerShown: false }} 
        />
        <Tab.Screen 
          name="News" 
          component={NewsScreen} 
          options={{ tabBarLabel: 'News', headerShown: false }} 
        />
        <Tab.Screen 
          name="Volunteers" 
          component={VolunteersScreen} 
          options={{ tabBarLabel: 'Volunteers', headerShown: false }} 
        />
      </Tab.Navigator>
    </>
  );
}