import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Navbar from './Navbar';
import MyNetwork from '../../screens/main/MyNetwork';
import ProfileScreen from '@screens/main/Profile';
import { TouchableOpacity, Text, View, Alert, TextStyle, Linking } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import  api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppDrawerParamList = {
  Home: undefined;
  MyNetwork: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export default function AppNavigator() {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try{
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '');
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '');
      const response = await api.get('auth/logout', {
        headers: { 'user-id': userId, Authorization: `Bearer ${token}` }
      });
      console.log('Auth response:', response.data);
    }
    catch (error) { 
      console.error('Error during logout:', error);
      Alert.alert('Logout Error', 'An error occurred while logging out. Please try again.');
    }
    finally{      
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      logout();
    }
  }

  const CustomDrawerContent = (props: any) => {
    const { state, navigation } = props;
    const currentRoute = state?.routes?.[state.index]?.name ?? '';
  
    const getButtonStyle = (routeName: string) => ({
      color: currentRoute === routeName ? 'black' : 'gray',
      fontWeight: currentRoute === routeName ? 'bold' : 'normal',
      fontSize: 16,
      marginLeft: 10,
    });
  
    const menuItems = [
      {
        name: 'Home',
        icon: <FontAwesome5 name="home" size={18} color={currentRoute === 'Home' ? 'black' : 'gray'} />,
      },
      {
        name: 'MyNetwork',
        icon: <FontAwesome5 name="users" size={18} color={currentRoute === 'MyNetwork' ? 'black' : 'gray'} />,
      },
      {
        name: 'Profile',
        icon: <MaterialIcons name="person" size={20} color={currentRoute === 'Profile' ? 'black' : 'gray'} />,
      },
    ];
  
    return (
      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: 15 }}>
        <View>
          {menuItems.map(({ name, icon }) => (
            <TouchableOpacity
              key={name}
              onPress={() => navigation.navigate(name)}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}
            >
              {icon}
              <Text style={getButtonStyle(name) as TextStyle}>{name === 'MyNetwork' ? 'My Network' : name}</Text>
            </TouchableOpacity>
          ))}
  
          {/* Donate Button */}
          <TouchableOpacity
            onPress={() => Linking.openURL('https://www.gofundme.com/f/lebanon-donation-fund')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}
          >
            <FontAwesome5 name="donate" size={18} color="gray" />
            <Text style={{ color: 'gray', fontSize: 16, marginLeft: 10 }}>Donate</Text>
          </TouchableOpacity>
  
          {/* Logout Button */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Logged Out', 'You are about to be logged out.', [
                { text: 'OK', onPress: () => handleLogout() },
              ]);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}
          >
            <MaterialIcons name="logout" size={20} color="gray" />
            <Text style={{ color: 'gray', fontSize: 16, marginLeft: 10 }}>Logout</Text>
          </TouchableOpacity>
        </View>
  
        {/* Bottom Section */}
        <View>
          {/* Contact Us Button */}
          <TouchableOpacity
            onPress={() => Linking.openURL('https://your-placeholder-link.com')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}
          >
            <Feather name="help-circle" size={20} color="gray" />
            <Text style={{ color: 'gray', fontSize: 16, marginLeft: 10 }}>Contact Us</Text>
          </TouchableOpacity>
  
          {/* Copyright */}
          <Text style={{ textAlign: 'center', color: 'gray', fontSize: 12, paddingBottom: 10 }}>
            © 2025 Chris Daou & Vicken Kendirjian
          </Text>
        </View>
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
        unmountOnBlur: true,
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
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerLabel: 'Profile' }} />
    </Drawer.Navigator>
  );
}
