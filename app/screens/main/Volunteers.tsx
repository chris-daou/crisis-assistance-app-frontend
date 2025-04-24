import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Keyboard,
  Linking,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';
import api from '../../services/api';
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
  const [workType, setWorkType] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(0);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false); 
  const [phoneNumber, setPhoneNumber] = useState('');
  
  <TextInput
  style={styles.input}
  placeholder="Phone Number"
  value={isPhoneFocused || phoneNumber ? `🇱🇧  +961 ${phoneNumber}` : ""}
  onFocus={() => setIsPhoneFocused(true)}
  onBlur={() => setIsPhoneFocused(false)}
  onChangeText={(text) => {
    const prefix = "🇱🇧  +961 ";
    let cleanedInput = text.startsWith(prefix)
      ? text.slice(prefix.length).replace(/\s/g, "")
      : text.replace(/\s/g, "");
    const validPrefixes = {
      "3": 6, "70": 6, "71": 6, "76": 6, "78": 6, "79": 6, "81": 6,
    };
    const isValidPartialPrefix = Object.keys(validPrefixes).some((p) =>
      p.startsWith(cleanedInput) || cleanedInput.startsWith(p)
    );
    const matchingPrefix = Object.keys(validPrefixes).find((p) =>
      cleanedInput.startsWith(p)
    );
    if (isValidPartialPrefix) {
      const prefixLength = matchingPrefix ? matchingPrefix.length : 0;
      const maxLength = matchingPrefix ? validPrefixes[matchingPrefix as keyof typeof validPrefixes] : 6;
      if (cleanedInput.length <= prefixLength + maxLength) {
        setPhoneNumber(cleanedInput);
      }
    } else if (cleanedInput === "") {
      setPhoneNumber("");
    }
  }}
  keyboardType="phone-pad"
  autoCorrect={false}
  autoCapitalize="none"
/>

  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const workTypes = ['Maintenance', 'Medical', 'Psychological', 'Logistics'];

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await api.get("user/volunteer/volunteers-accepted", {
        headers: {
          "user-id": (await AsyncStorage.getItem("user"))?.replace(/"/g, ""),
          Authorization: `Bearer ${(await AsyncStorage.getItem("token"))?.replace(/"/g, "")}`,
        },
      });
      console.log("Response from API:", response.data);

      if (response.status === 200) {
        await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
        const volunteersData = response.data.data.map((v: any) => ({
          id: v._id,
          name: v.userId.name+" " + v.userId.lastname,
          jobTitle: v.title,
          jobDescription: v.description,
          whatsappLink: `https://wa.me/${v.contactDetails.replace('+', '')}`,
        }));
        setVolunteers(volunteersData);
      } else {
        Alert.alert("Error", "Failed to fetch network connections.");
      }
    } catch (error) {
      console.error("Error fetching volunteers:", (error as any).response?.data || error);
      if ((error as any).response?.data?.token) {
        await AsyncStorage.setItem("token", JSON.stringify((error as any).response.data.token));
      }
      Alert.alert("Error", "An error occurred while fetching connections.");
    }
  };

  const handleRegisterVolunteer = async () => {
    try {
      
      if (jobTitle=='' || jobDescription=='' || workType=='' || phoneNumber=='') {
        Alert.alert('Error', 'Please fill in all fields.');
        return;
      }
      const response = await api.post(
        'user/volunteer/apply',
        {
          title: jobTitle,
          description: jobDescription,
          service: workType,
          contactDetails: phoneNumber,
        },
        {
          headers: {
            'user-id': (await AsyncStorage.getItem('user'))?.replace(/"/g, ''),
            Authorization: `Bearer ${(await AsyncStorage.getItem('token'))?.replace(/"/g, '')}`,
          },
        }
      );
      console.log('Response from API:', response.data);

      // Save new token if present
      if (response.data.token) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
      }

      Alert.alert('Registration Successful', 'Your volunteer registration has been submitted.');

      // Close modal and reset state
      setIsRegisterModalVisible(false);
      setJobTitle('');
      setJobDescription('');
      setWorkType('');
      setIsDropdownOpen(false);
      setPhoneNumber('');
    } catch (error) {
      console.error('Error registering volunteer:', error);
      Alert.alert('Registration Failed', 'An error occurred while registering as a volunteer.');
      //save new token if present
      if ((error as any).response?.data?.token) {
        await AsyncStorage.setItem('token', JSON.stringify((error as any).response.data.token));
    }
  };
}

  const handleDropdownOpen = () => {
    // Dismiss the keyboard when opening the dropdown
    if (!isDropdownOpen) {
      Keyboard.dismiss();
      scrollViewRef.current?.scrollTo({
        y: dropdownPosition - 50 + 300,
        animated: true,
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;
    setDropdownPosition(y);
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
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                There are no volunteers available at this time. Check back later!
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>{item.jobTitle}</Text>
                <Text style={styles.details}>{item.jobDescription}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // Check if the WhatsApp URL can be opened
                  Linking.canOpenURL(item.whatsappLink)
                    .then((supported) => {
                      if (supported) {
                        return Linking.openURL(item.whatsappLink);
                      } else {
                        console.error("Don't know how to open URI: " + item.whatsappLink);
                      }
                    })
                    .catch((err) => console.error('An error occurred', err));
                }}
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
              <TouchableOpacity
                style={[styles.input, styles.dropdown]}
                onPress={handleDropdownOpen}
                onLayout={handleDropdownLayout}
              >
                <Text style={[styles.placeholder, workType ? styles.selectedText : null]}>
                  {workType || 'Select Work Type'}
                </Text>
                <MaterialIcons
                  name={isDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color="black"
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
              {isDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {workTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        setWorkType(type);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItem}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TextInput
                style={styles.input}
                placeholder="Job Title"
                value={jobTitle}
                // Close dropdown when job title gains focus
                onFocus={() => setIsDropdownOpen(false)}
                onChangeText={setJobTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Job Description"
                value={jobDescription}
                // Close dropdown when job description gains focus
                onFocus={() => setIsDropdownOpen(false)}
                onChangeText={setJobDescription}
              />
                      <TextInput
          style={styles.input}
          placeholder="Contact Details"
          value={isPhoneFocused || phoneNumber ? `🇱🇧  +961 ${phoneNumber}` : ""}
          onFocus={() => setIsPhoneFocused(true)}
          onBlur={() => setIsPhoneFocused(false)}
          onChangeText={(text) => {
            const prefix = "🇱🇧  +961 ";
            let cleanedInput = text.startsWith(prefix)
              ? text.slice(prefix.length).replace(/\s/g, "")
              : text.replace(/\s/g, "");
            const validPrefixes = {
              "3": 6, "70": 6, "71": 6, "76": 6, "78": 6, "79": 6, "81": 6,
            };
            const isValidPartialPrefix = Object.keys(validPrefixes).some((p) =>
              p.startsWith(cleanedInput) || cleanedInput.startsWith(p)
            );
            const matchingPrefix = Object.keys(validPrefixes).find((p) =>
              cleanedInput.startsWith(p)
            );
            if (isValidPartialPrefix) {
              const prefixLength = matchingPrefix ? matchingPrefix.length : 0;
              const maxLength = matchingPrefix ? validPrefixes[matchingPrefix as keyof typeof validPrefixes] : 6;
              if (cleanedInput.length <= prefixLength + maxLength) {
                setPhoneNumber(cleanedInput);
              }
            } else if (cleanedInput === "") {
              setPhoneNumber("");
            }
          }}
          keyboardType="phone-pad"
          autoCorrect={false}
          autoCapitalize="none"
        />

              <TouchableOpacity style={styles.modalButton} onPress={handleRegisterVolunteer}>
                <Text style={styles.modalButtonText}>Submit Registration</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsRegisterModalVisible(false);
                  setIsDropdownOpen(false);
                  setJobDescription('');
                  setIsPhoneFocused(false);
                  setJobTitle('');
                  setWorkType('');
                }}
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
    maxHeight: '90%',
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
  dropdown: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  arrowIcon: {
    marginLeft: 10,
    color: 'black',
  },
  placeholder: {
    color: 'gray',
    fontSize: 16,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 7,
    marginTop: -10,
    marginBottom: 10,
  },
  selectedText: {
    color: 'black',
  },
  dropdownItem: {
    padding: 15,
    fontSize: 16,
    color: 'black',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  // Styles for the empty volunteers placeholder
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 260,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

