import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import MapScreen from './app/screens/Map';
import AssistantScreen from './app/screens/Assistant';
import NewsScreen from './app/screens/News';
import VolunteersScreen from './app/screens/Volunteers';
import SettingsScreen from './app/screens/Settings';

type TabParamList = {
  Map: undefined;
  Assistant: undefined;
  News: undefined;
  Volunteers: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function App() {
  return (
    <NavigationContainer>
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
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ tabBarLabel: 'Settings', headerShown: false }} 
        />

      </Tab.Navigator>
    </NavigationContainer>
  );
}