import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';

export default function ProfileScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

  const [userData, setUserData] = useState({
    name: '',
    lastname: '',
    phone: '',
    bloodType: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData({
            name: parsedData.name || '',
            lastname: parsedData.lastname || '',
            phone: parsedData.phone || '',
            bloodType: parsedData.bloodType || ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert('Logged Out', 'You have been successfully logged out.');
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete your account. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Redirecting to change password screen...');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          <FontAwesome5 name="bars" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>User Profile</Text>

      <View style={styles.card}>
        <View style={styles.item}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{userData.name} {userData.lastname}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>+961 {userData.phone}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Blood Type:</Text>
          <Text style={styles.value}>{userData.bloodType}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
        <MaterialIcons name="lock" size={18} color="gray" />
        <Text style={styles.actionText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
        <MaterialIcons name="delete" size={18} color="gray" />
        <Text style={styles.actionText}>Delete Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome5 name="sign-out-alt" size={18} color="gray" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerIcons: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'gray',
    marginBottom: 30,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  item: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: 'gray',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#ebebeb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
    width: '100%',
  },
  actionText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ebebeb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  logoutText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
  },
});