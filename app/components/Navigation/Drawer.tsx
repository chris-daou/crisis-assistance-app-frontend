import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Alert, View, Text, TouchableOpacity } from 'react-native';
import Navbar from './Navbar';
import Login from '../../screens/Login';
import Signup from '../../screens/Signup';
import MyNetwork from '../../screens/MyNetwork';
import OtpScreen from '../../screens/Otp';

export type RootStackParamList = {
  Drawer: undefined;
  Otp: { phone: string };
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  MyNetwork: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

// Drawer Navigator (UI)
function DrawerNavigator() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Define the logout function
  const logout = () => {
    // Clear authentication tokens or handle logout logic
    // Example: AsyncStorage.removeItem('authToken');

    Alert.alert('Logged Out', 'You have successfully logged out.', [
      {
        text: 'OK',
        onPress: () => {
          // Navigate to Login screen after logout
          navigation.navigate('Login');
        },
      },
    ]);
  };

  // Custom Drawer Content
  const CustomDrawerContent = (props: any) => {
    // Get the current active route name
    const currentRoute = useNavigationState((state) => state.routes[state.index].name);

    const getButtonStyle = (routeName: string) => {
      // Return black color if the current screen is the same as the route name
      return currentRoute === routeName ? { color: 'black' } : { color: 'gray' };
    };

    return (
      <View style={{ flex: 1, paddingTop: 15 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={{ padding: 20, ...getButtonStyle('Home') }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ padding: 20, ...getButtonStyle('Login') }}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={{ padding: 20, ...getButtonStyle('Signup') }}>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyNetwork')}>
          <Text style={{ padding: 20, ...getButtonStyle('MyNetwork') }}>My Network</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity onPress={logout}>
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
      drawerContent={CustomDrawerContent}
    >
      <Drawer.Screen name="Home" component={Navbar} options={{ drawerLabel: 'Home' }} />
      <Drawer.Screen name="Login" component={Login} options={{ drawerLabel: 'Login' }} />
      <Drawer.Screen name="Signup" component={Signup} options={{ drawerLabel: 'Signup' }} />
      <Drawer.Screen name="MyNetwork" component={MyNetwork} options={{ drawerLabel: 'My Network' }} />
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
