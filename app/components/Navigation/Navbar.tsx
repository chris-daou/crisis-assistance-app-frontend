import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../../screens/Map';
import AssistantScreen from '../../screens/Assistant';
import NewsScreen from '../../screens/News';
import VolunteersScreen from '../../screens/Volunteers';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabParamList = {
  Map: undefined;
  Assistant: undefined;
  News: undefined;
  Volunteers: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function Navbar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
      <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          header: () => (
            <View style={[styles.header, { paddingTop: insets.top }]}>
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.menuButton}>
                <Icon name="menu" size={28} color="black" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen name="News" component={NewsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Volunteers" component={VolunteersScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  menuButton: {
    padding: 10,
  },
});
