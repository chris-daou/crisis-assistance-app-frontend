import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NetworkUser {
  senderId: string;
  senderLastname: string;
  senderPhone: string;
  senderName: string;
  id: string;
}

export default function MyNetwork() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isPhoneFocused, setIsPhoneFocused] = useState<boolean>(false);
  const [network, setNetwork] = useState<NetworkUser[]>([]);
  const [requests, setRequests] = useState<NetworkUser[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isRequestsModalVisible, setIsRequestsModalVisible] = useState<boolean>(false);

  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const response = await api.get('user/social/connections', {
        headers: { 'user-id': userId, Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        setNetwork(response.data.accepted);
      } else {
        Alert.alert('Error', 'Failed to fetch network connections.');
      }
    } catch (err: any) {
      console.error('Error fetching connections:', err.response?.data || err);
      if (err.response?.data?.token) {
        await AsyncStorage.setItem('token', JSON.stringify(err.response.data.token));
      }
      Alert.alert('Error', 'An error occurred while fetching connections.');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const response = await api.get('user/social/connections', {
        headers: { 'user-id': userId, Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        setRequests(response.data.pending);
      } else {
        Alert.alert('Error', 'Failed to fetch requests.');
      }
    } catch (err: any) {
      console.error('Error fetching requests:', err.response?.data || err);
      if (err.response?.data?.token) {
        await AsyncStorage.setItem('token', JSON.stringify(err.response.data.token));
      }
      Alert.alert('Error', 'An error occurred while fetching requests.');
    }
  };

  const handleRemoveUser = (name: string, lastname: string, phone: string) => {
    Alert.alert(
      'Remove Connection?',
      `Are you sure you want to remove ${name} ${lastname} from your network?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => confirmDeleteConnection(phone) },
      ]
    );
  };

  const confirmDeleteConnection = async (phone: string) => {
    try {
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const response = await api.post(
        'user/social/remove-friend',
        { targetPhone: phone },
        { headers: { 'user-id': userId, Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        fetchConnections();
        Alert.alert('Connection Removed', 'The user has been removed from your network.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to remove connection.');
      }
    } catch (err: any) {
      console.error('Error removing connection:', err.response?.data || err);
      if (err.response?.data?.token) {
        await AsyncStorage.setItem('token', JSON.stringify(err.response.data.token));
      }
      Alert.alert('Error', 'An error occurred while removing the connection.');
    }
  };

  const handleAcceptRequest = async (user: NetworkUser) => {
    try {
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const response = await api.post(
        'user/social/handle-connection',
        { targetUserId: user.senderId, action: 'accept' },
        { headers: { 'user-id': userId, Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        fetchConnections();
        setRequests(prev => prev.filter(r => r.senderId !== user.senderId));
        Alert.alert('Request Accepted', 'You have accepted the request successfully.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to accept request.');
      }
    } catch (err: any) {
      console.error('Error accepting request:', err.response?.data || err);
      if (err.response?.data?.token) {
        await AsyncStorage.setItem('token', JSON.stringify(err.response.data.token));
      }
      Alert.alert('Error', 'An error occurred while accepting the request.');
    }
  };

  const handleRejectRequest = async (user: NetworkUser) => {
    try {
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const response = await api.post(
        'user/social/handle-connection',
        { targetUserId: user.senderId, action: 'reject' },
        { headers: { 'user-id': userId, Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        fetchConnections();
        setRequests(prev => prev.filter(r => r.senderId !== user.senderId));
        Alert.alert('Request Rejected', 'You have rejected the request.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reject request.');
      }
    } catch (err: any) {
      console.error('Error rejecting request:', err.response?.data || err);
      if (err.response?.data?.token) {
        await AsyncStorage.setItem('token', JSON.stringify(err.response.data.token));
      }
      Alert.alert('Error', 'An error occurred while rejecting the request.');
    }
  };

  const handleAddUserRequest = async () => {
    try {
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const response = await api.post(
        'user/social/connect',
        { targetPhone: '+961' + phoneNumber },
        { headers: { 'user-id': userId, Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        Alert.alert('Request Sent', 'Your request has been sent successfully.');
        setIsAddModalVisible(false);
        setPhoneNumber('');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send request.');
      }
    } catch (err: any) {
      console.error('Error sending request:', err.response?.data || err.message);
      if (err.response?.data?.token) {
        await AsyncStorage.setItem('token', JSON.stringify(err.response.data.token));
      }
      switch (err.response?.status) {
        case 505:
          Alert.alert('Error', 'You already sent a request to that user. Wait for them to respond.');
          break;
        case 507:
          Alert.alert('Error', 'You cannot send a request to yourself.');
          break;
        case 404:
          Alert.alert('Error', 'User not found.');
          break;
        default:
          Alert.alert('Error', 'An error occurred while sending the request.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerIcons}>
          <View style={styles.leftIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setIsAddModalVisible(true)}>
              <FontAwesome5 name="plus" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { fetchPendingRequests(); setIsRequestsModalVisible(true); }}>
              <FontAwesome5 name="envelope" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <FontAwesome5 name="bars" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Accepted Connections */}
        <FlatList
          data={network}
          keyExtractor={item => item.senderId}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.name}>{item.senderName} {item.senderLastname}</Text>
                <Text style={styles.details}>{item.senderPhone}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveUser(item.senderName, item.senderLastname, item.senderPhone)}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {/* Add Connection Modal */}
        <Modal visible={isAddModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add to Network</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={isPhoneFocused || phoneNumber ? `🇱🇧  +961 ${phoneNumber}` : ''}
                onFocus={() => setIsPhoneFocused(true)}
                onBlur={() => setIsPhoneFocused(false)}
                onChangeText={text => {
                  const prefix = '🇱🇧  +961 ';
                  let cleaned = text.startsWith(prefix)
                    ? text.slice(prefix.length).replace(/\s/g, '')
                    : text.replace(/\s/g, '');
                  const validPrefixes = { '3': 6, '70': 6, '71': 6, '76': 6, '78': 6, '79': 6, '81': 6 };
                  const isPartial = Object.keys(validPrefixes).some(p => p.startsWith(cleaned) || cleaned.startsWith(p));
                  const match = Object.keys(validPrefixes).find(p => cleaned.startsWith(p));
                  if (isPartial) {
                    const max = match && match in validPrefixes ? validPrefixes[match as keyof typeof validPrefixes] : 6;
                    if (cleaned.length <= (match?.length || 0) + max) setPhoneNumber(cleaned);
                  } else if (!cleaned) {
                    setPhoneNumber('');
                  }
                }}
                keyboardType="phone-pad"
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleAddUserRequest}>
                <Text style={styles.modalButtonText}>Send Request</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setIsAddModalVisible(false); setPhoneNumber(''); setIsPhoneFocused(false); }}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Pending Requests Modal */}
        <Modal visible={isRequestsModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pending Requests</Text>
              {requests.length === 0 ? (
                <Text style={styles.noRequests}>No pending requests</Text>
              ) : (
                <FlatList
                  data={requests}
                  keyExtractor={item => item.senderId}
                  style={styles.requestsList}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <View style={styles.requestCard}>
                      <View style={styles.requestInfo}>
                        <Text style={styles.name}>{item.senderName} {item.senderLastname}</Text>
                        <Text style={styles.details}>{item.senderPhone}</Text>
                      </View>
                      <View style={styles.requestButtons}>
                        <TouchableOpacity onPress={() => handleAcceptRequest(item)}>
                          <FontAwesome5 name="check" size={20} color="green" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleRejectRequest(item)}>
                          <FontAwesome5 name="times" size={20} color="red" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )}
              <TouchableOpacity onPress={() => setIsRequestsModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    marginBottom: 40,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginRight: 15,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    color: 'gray',
  },
  modalOverlay: {
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
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 7,
    width: 170,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#ebebeb',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: 'gray',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  noRequests: {
    textAlign: 'center',
    color: 'gray',
    marginVertical: 10,
  },
  requestsList: {
    width: '100%',
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
    width: '100%',
  },
  requestInfo: {
    flex: 1,
  },
  requestButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
});
