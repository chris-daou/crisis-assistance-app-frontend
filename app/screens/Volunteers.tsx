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
import { RootStackParamList } from '../components/Navigation/Drawer';
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
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

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

  const handleRegisterVolunteer = async () => {
    try {
      // Call the API to register the volunteer here
      // Example: await api.post('/volunteer/register', { jobTitle, jobDescription });

      Alert.alert('Registration Successful', 'Your volunteer registration has been submitted.');

      // Close modal and reset state
      setIsRegisterModalVisible(false);
      setJobTitle('');
      setJobDescription('');
    } catch (error) {
      console.error('Error registering volunteer:', error);
      Alert.alert('Registration Failed', 'An error occurred while registering as a volunteer.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setIsRegisterModalVisible(true)}>
            <FontAwesome5 name="user-plus" size={24} color="gray" />
          </TouchableOpacity>
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
                // onPress={() => {
                //   Linking.openURL(item.whatsappLink);
                // }}
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
              <TouchableOpacity
                onPress={() => setIsRegisterModalVisible(false)}
                style={styles.closeButton}
              >
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
    paddingHorizontal: 20, // Add padding to ensure dynamic width based on text length
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
