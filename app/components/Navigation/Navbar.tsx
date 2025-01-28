import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../../screens/Map';
import AssistantScreen from '../../screens/Assistant';
import NewsScreen from '../../screens/News';
import VolunteersScreen from '../../screens/Volunteers';
import { TouchableOpacity, StyleSheet, View } from 'react-native'; // Remove unused imports
import Icon from 'react-native-vector-icons/Feather'; // Import Feather icon
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from './Drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabParamList = {
  Map: undefined;
  Assistant: undefined;
  News: undefined;
  Volunteers: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function BottomTabNavigator() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Custom header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
          <Icon name="menu" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
        let iconName: string = '';

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
          tabBarStyle: { backgroundColor: 'red', paddingBottom: 5, paddingTop: 5, height: 60 },
          tabBarActiveTintColor: 'green', // Active tab icon and label color
          tabBarInactiveTintColor: 'gray', // Inactive tab icon and label color
        })}
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

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white', // Header background color
    flexDirection: 'row', // Arrange items horizontally
    justifyContent: 'flex-end', // Align the button to the right
    alignItems: 'center', // Center the button vertically
    paddingHorizontal: 15, // Add padding for spacing
  },
  menuButton: {
    padding: 10, // Add touchable area around the icon
  },
});
