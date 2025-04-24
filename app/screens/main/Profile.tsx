import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const { logout } = useContext(AuthContext);
  const [isChangePassModalVisible, setIsChangePassModalVisible] = useState(false);
  const [userData, setUserData] = useState({ name: '', lastname: '', phone: '', bloodType: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '');
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '');
      const response = await api.get('user/profile/view-profile', {
        headers: { Authorization: `Bearer ${token}`, 'user-id': userId },
      });
      await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
      setUserData({
        name: response.data.profile.name,
        lastname: response.data.profile.lastname,
        phone: response.data.profile.phone,
        bloodType: response.data.profile.bloodType,
      });
    } catch (err) {
      console.error(err);
      if ((err as any).response?.data?.token) {
        await AsyncStorage.setItem('token', JSON.stringify((err as any).response.data.token));
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDeleteAccount() },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '');
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '');
      await api.delete('user/profile/delete-account', {
        headers: { Authorization: `Bearer ${token}`, 'user-id': userId },
      });
      Alert.alert('Success', 'Account deleted successfully.');
      await AsyncStorage.clear(); 
      logout();
    }
    catch (err) {
      console.error(err);
      Alert.alert('Error', (err as any).response?.data?.message || 'Failed to delete account.');
    }
  }

  const handleChangePassword = () => setIsChangePassModalVisible(true);

  const handleConfirmChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    try {
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '');
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '');
      const response = await api.post(
        'user/profile/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}`, 'user-id': userId } }
      );
      if (response.data.token) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
      }
      Alert.alert('Success', 'Password changed successfully.');
      setIsChangePassModalVisible(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowOldPass(false);
      setShowNewPass(false);
      setShowConfirmPass(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', (err as any).response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <>
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
            <Text style={styles.value}>{userData.phone}</Text>
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
      </ScrollView>

      <Modal visible={isChangePassModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Old Password"
                secureTextEntry={!showOldPass}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <Pressable style={styles.eyeIcon} onPress={() => setShowOldPass(p => !p)}>
                <Feather name={showOldPass ? 'eye-off' : 'eye'} size={24} color="gray" />
              </Pressable>
            </View>

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password"
                secureTextEntry={!showNewPass}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Pressable style={styles.eyeIcon} onPress={() => setShowNewPass(p => !p)}>
                <Feather name={showNewPass ? 'eye-off' : 'eye'} size={24} color="gray" />
              </Pressable>
            </View>

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm New Password"
                secureTextEntry={!showConfirmPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable style={styles.eyeIcon} onPress={() => setShowConfirmPass(p => !p)}>
                <Feather name={showConfirmPass ? 'eye-off' : 'eye'} size={24} color="gray" />
              </Pressable>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleConfirmChangePassword}>
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsChangePassModalVisible(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 7,
    height: 50,
    paddingHorizontal: 20,
    paddingRight: 50,       // leave room for the eye icon
    marginBottom: 10,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
  },
  modalButton: {
    backgroundColor: '#ebebeb',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: 'gray',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  closeText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
