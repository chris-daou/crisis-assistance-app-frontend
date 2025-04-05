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
  Linking,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
// Updated import: use AppDrawerParamList from your new navigation file instead of RootStackParamList
import { AppDrawerParamList } from '../components/Navigation/AppNavigator';
import api from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Volunteer {
  id: string;
  name: string;
  jobTitle: string;
  jobDescription: string;
  whatsappLink: string;
}

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

  // Sample volunteers for preview
  const sampleVolunteers: Volunteer[] = [
    {
      id: '1',
      name: 'John Doe',
      jobTitle: 'Doctor',
      jobDescription: 'Provides medical assistance to those in need.',
      whatsappLink: 'https://wa.me/1234567890',
    },
    {
      id: '2',
      name: 'Jane Smith',
      jobTitle: 'Psychologist',
      jobDescription: 'Offers psychological support for individuals affected by trauma.',
      whatsappLink: 'https://wa.me/1234567891',
    },
  ];

  useEffect(() => {
    // Fetch the volunteer data from the API here
    // For now, using the sample data
    setVolunteers(sampleVolunteers);
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.get('user/social/connections', {
        headers: {
          'user-id': (await AsyncStorage.getItem('user'))?.replace(/"/g, ''),
          Authorization: `Bearer ${(await AsyncStorage.getItem('token'))?.replace(/"/g, '')}`,
        },
      });

      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        setVolunteers(response.data.accepted); // Adjust to match actual key in response
      } else {
        Alert.alert('Error', 'Failed to fetch network connections.');
      }
    } catch (error) {
      console.error('Error fetching connections:', (error as any).response?.data || error);
      await AsyncStorage.setItem('token', JSON.stringify((error as any).response.data.token));
      Alert.alert('Error', 'An error occurred while fetching connections.');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('user/social/connections', {
        headers: {
          'user-id': (await AsyncStorage.getItem('user'))?.replace(/"/g, ''),
          Authorization: `Bearer ${(await AsyncStorage.getItem('token'))?.replace(/"/g, '')}`,
        },
      });

      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        // Adjust based on actual response structure
        // setRequests(response.data.pending);
      } else {
        Alert.alert('Error', 'Failed to fetch requests.');
      }
    } catch (error) {
      await AsyncStorage.setItem('token', JSON.stringify((error as any).response.data.token));
      console.error('Error fetching requests:', (error as any).response?.data || error);
      Alert.alert('Error', 'An error occurred while fetching requests.');
    }
  };

  const handleRemoveUser = (id: string) => {
    setVolunteers(volunteers.filter(user => user.id !== id));
  };

  const handleAcceptRequest = async (user: Volunteer) => {
    try {
      console.log('Accepting request for user:', user);
      const response = await api.post(
        'user/social/handle-connection',
        {
          targetUserId: user.id,
          action: 'accept',
        },
        {
          headers: {
            'user-id': (await AsyncStorage.getItem('user'))?.replace(/"/g, ''),
            Authorization: `Bearer ${(await AsyncStorage.getItem('token'))?.replace(/"/g, '')}`,
          },
        }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        await fetchConnections();
        Alert.alert('Request Accepted', 'You have accepted the request successfully.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to accept request.');
      }
    } catch (error) {
      await AsyncStorage.setItem('token', JSON.stringify((error as any).response.data.token));
      console.error('Error accepting request:', (error as any).response?.data || error);
      Alert.alert('Error', 'An error occurred while accepting the request.');
    }
  };

  const handleRejectRequest = (id: string) => {
    // Assuming you'll remove the request from a state variable called "requests"
    // setRequests(requests.filter(req => req.id !== id));
  };

  const handleAddUserRequest = async () => {
    try {
      const response = await api.post(
        'user/social/connect',
        {
          targetPhone: '+961' + jobTitle, // Assuming jobTitle holds phone? You might want to change this.
        },
        {
          headers: {
            'user-id': (await AsyncStorage.getItem('user'))?.replace(/"/g, ''),
            Authorization: `Bearer ${(await AsyncStorage.getItem('token'))?.replace(/"/g, '')}`,
          },
        }
      );
      console.log('Response:', response.data);
      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
        Alert.alert('Request Sent', 'Your request has been sent successfully.');
        setIsRegisterModalVisible(false);
      } else {
        Alert.alert('Request Failed', response.data.message || 'Failed to send request.');
      }
    } catch (error) {
      console.error('Error sending request:', (error as any).response?.data || (error as any).message);
      await AsyncStorage.setItem('token', JSON.stringify((error as any).response.data.token));
      if ((error as any).status === 505) {
        Alert.alert('Error sending request:', 'You already sent a request to that user. Wait for them to accept or reject it.');
      } else if ((error as any).status === 507) {
        Alert.alert('Error sending request:', 'You cannot send a request to yourself.');
      } else if ((error as any).status === 404) {
        Alert.alert('Error sending request:', 'User not found.');
      } else {
        Alert.alert('Error sending request:', 'An error occurred while sending the request.');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <View style={styles.leftIcons}>
            <TouchableOpacity onPress={() => setIsRegisterModalVisible(true)}>
              <FontAwesome5 name="user-plus" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                fetchPendingRequests();
                // setIsRequestsModalVisible(true);
              }}
            >
              <FontAwesome5 name="envelope" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <FontAwesome5 name="bars" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Volunteers List */}
        <FlatList
          data={volunteers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>{item.jobTitle}</Text>
                <Text style={styles.details}>{item.jobDescription}</Text>
              </View>
              <TouchableOpacity
                // Uncomment to enable WhatsApp linking
                // onPress={() => Linking.openURL(item.whatsappLink)}
              >
                <FontAwesome5 name="whatsapp" size={24} color="green" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Register Modal */}
        <Modal visible={isRegisterModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Register as a Volunteer</Text>
              <TextInput
                style={styles.input}
                placeholder="Job Title"
                value={jobTitle}
                onChangeText={setJobTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Job Description"
                value={jobDescription}
                onChangeText={setJobDescription}
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleRegisterVolunteer}>
                <Text style={styles.modalButtonText}>Submit Registration</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsRegisterModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: '80%',
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
    width: '100%',
    marginBottom: 10,
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
  leftIcons: {
    flexDirection: 'row',
    gap: 15,
  },
});
