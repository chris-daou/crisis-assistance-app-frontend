import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Navbar from './Navbar';
import MyNetwork from '../../screens/MyNetwork';
import { TouchableOpacity, Text, View, Alert } from 'react-native';
import { AuthContext } from './AuthContext';

export type AppDrawerParamList = {
  Home: undefined;
  MyNetwork: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export default function AppNavigator() {
  const { logout } = useContext(AuthContext);

  // Custom Drawer Content using props.state to determine the current route
  const CustomDrawerContent = (props: any) => {
    const { state, navigation } = props;
    // Ensure state exists and then get the current route name
    const currentRoute = state && state.routes && state.routes[state.index]
      ? state.routes[state.index].name
      : "";
      
    const getButtonStyle = (routeName: string) => {
      return currentRoute === routeName ? { color: 'black' } : { color: 'gray' };
    };

    return (
      <View style={{ flex: 1, paddingTop: 15 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={{ padding: 20, ...getButtonStyle('Home') }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyNetwork')}>
          <Text style={{ padding: 20, ...getButtonStyle('MyNetwork') }}>My Network</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Logged Out', 'You have successfully logged out.', [
              {
                text: 'OK',
                onPress: () => logout(),
              },
            ]);
          }}
        >
          <Text style={{ padding: 20, color: 'gray' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false,
        swipeEnabled: false,
        drawerType: 'front',
        drawerActiveBackgroundColor: '#EBEBEB',
        drawerActiveTintColor: '#000',
        drawerInactiveTintColor: 'gray',
        drawerStyle: {
          backgroundColor: '#EBEBEB',
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          transform: [{ translateX: 700 }],
          bottom: 65,
          top: 30,
          width: '50%',
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={Navbar} options={{ drawerLabel: 'Home' }} />
      <Drawer.Screen name="MyNetwork" component={MyNetwork} options={{ drawerLabel: 'My Network' }} />
    </Drawer.Navigator>
  );
}
