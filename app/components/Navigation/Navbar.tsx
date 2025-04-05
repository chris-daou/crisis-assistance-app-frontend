import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../../screens/main/Map';
import AssistantScreen from '../../screens/main/Assistant';
import NewsScreen from '../../screens/main/News';
import VolunteersScreen from '../../screens/main/Volunteers';
import Icon from 'react-native-vector-icons/Feather';

type TabParamList = {
  Map: undefined;
  Assistant: undefined;
  News: undefined;
  Volunteers: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function Navbar() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Assistant') {
            iconName = 'message-circle';
          } else if (route.name === 'News') {
            iconName = 'file-text';
          } else if (route.name === 'Volunteers') {
            iconName = 'users';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#EBEBEB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false, unmountOnBlur: true, }} />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          headerShown: false,
          unmountOnBlur: true,

        }}
      />
      <Tab.Screen name="News" component={NewsScreen} options={{ headerShown: false, unmountOnBlur: true, }} />
      <Tab.Screen name="Volunteers" component={VolunteersScreen} options={{ headerShown: false, unmountOnBlur: true, }} />
    </Tab.Navigator>
  );
}