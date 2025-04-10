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
// Update the import to use AppDrawerParamList from the new navigation file
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NetworkUser {
  senderId: any;
  senderLastname: string;
  senderPhone: string;
  senderName: string;
  id: string;
  name: string;
  phone: string;
}

export default function MyNetwork() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

  const [network, setNetwork] = useState<NetworkUser[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isRequestsModalVisible, setIsRequestsModalVisible] = useState(false);
  const [requests, setRequests] = useState<NetworkUser[]>([]);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.get("user/social/connections", {
        headers: {
          "user-id": (await AsyncStorage.getItem("user"))?.replace(/"/g, ""),
          Authorization: `Bearer ${(await AsyncStorage.getItem("token"))?.replace(/"/g, "")}`,
        },
      });

      if (response.status === 200) {
        await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
        setNetwork(response.data.accepted); // Adjust to match actual key in response
      } else {
        Alert.alert("Error", "Failed to fetch network connections.");
      }
    } catch (error) {
      console.error("Error fetching connections:", (error as any).response?.data || error);
      await AsyncStorage.setItem("token", JSON.stringify((error as any).response.data.token));
      Alert.alert("Error", "An error occurred while fetching connections.");
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get("user/social/connections", {
        headers: {
          "user-id": (await AsyncStorage.getItem("user"))?.replace(/"/g, ""),
          Authorization: `Bearer ${(await AsyncStorage.getItem("token"))?.replace(/"/g, "")}`,
        },
      });

      if (response.status === 200) {
        await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
        setRequests(response.data.pending); // Adjust based on actual response structure
      } else {
        Alert.alert("Error", "Failed to fetch requests.");
      }
    } catch (error) {
      await AsyncStorage.setItem("token", JSON.stringify((error as any).response.data.token));
      console.error("Error fetching requests:", (error as any).response?.data || error);
      Alert.alert("Error", "An error occurred while fetching requests.");
    }
  };

  const handleRemoveUser = (id: string) => {
    setNetwork(network.filter(user => user.id !== id));
  };

  const handleAcceptRequest = async (user: NetworkUser) => {
    try {
      console.log("Accepting request for user:", user);
      const response = await api.post(
        "user/social/handle-connection",
        {
          targetUserId: user.senderId,
          action: "accept",
        },
        {
          headers: {
            "user-id": (await AsyncStorage.getItem("user"))?.replace(/"/g, ""),
            Authorization: `Bearer ${(await AsyncStorage.getItem("token"))?.replace(/"/g, "")}`,
          },
        }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
        await fetchConnections();
        setRequests(requests.filter(req => req.id !== user.id));
        Alert.alert("Request Accepted", "You have accepted the request successfully.");
      } else {
        Alert.alert("Error", response.data.message || "Failed to accept request.");
      }
    } catch (error) {
      await AsyncStorage.setItem("token", JSON.stringify((error as any).response.data.token));
      console.error("Error accepting request:", (error as any).response?.data || error);
      Alert.alert("Error", "An error occurred while accepting the request.");
    }
  };

  const handleRejectRequest = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
  };

  const handleAddUserRequest = async () => {
    try {
      const response = await api.post(
        "user/social/connect",
        {
          targetPhone: "+961" + phoneNumber,
        },
        {
          headers: {
            "user-id": (await AsyncStorage.getItem("user"))?.replace(/"/g, ""),
            Authorization: `Bearer ${(await AsyncStorage.getItem("token"))?.replace(/"/g, "")}`,
          },
        }
      );
      console.log("Response:", response.data);
      if (response.status === 200) {
        await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
        Alert.alert("Request Sent", "Your request has been sent successfully.");
        setIsAddModalVisible(false);
      } else {
        Alert.alert("Request Failed", response.data.message || "Failed to send request.");
      }
    } catch (error) {
      console.error("Error sending request:", (error as any).response?.data || (error as any).message);
      await AsyncStorage.setItem("token", JSON.stringify((error as any).response.data.token));
      if ((error as any).status === 505) {
        Alert.alert("Error sending request:", "You already sent a request to that user. Wait for them to accept or reject it.");
      } else if ((error as any).status === 507) {
        Alert.alert("Error sending request:", "You cannot send a request to yourself.");
      } else if ((error as any).status === 404) {
        Alert.alert("Error sending request:", "User not found.");
      } else {
        Alert.alert("Error sending request:", "An error occurred while sending the request.");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <View style={styles.leftIcons}>
            <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
              <FontAwesome5 name="plus" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                fetchPendingRequests();
                setIsRequestsModalVisible(true);
              }}
            >
              <FontAwesome5 name="envelope" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <FontAwesome5 name="bars" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Network List */}
        <FlatList
          data={network}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.name}>{item.senderName + " " + item.senderLastname}</Text>
                <Text style={styles.details}>{item.senderPhone}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveUser(item.id)}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Add User Modal */}
        <Modal visible={isAddModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add to Network</Text>
              <View style={styles.centeredContent}>
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
                      "3": 6,
                      "70": 6,
                      "71": 6,
                      "76": 6,
                      "78": 6,
                      "79": 6,
                      "81": 6,
                    };
                    const isValidPartialPrefix = Object.keys(validPrefixes).some((validPrefix) =>
                      validPrefix.startsWith(cleanedInput) || cleanedInput.startsWith(validPrefix)
                    );
                    const matchingPrefix = Object.keys(validPrefixes).find((validPrefix) =>
                      cleanedInput.startsWith(validPrefix)
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
                <TouchableOpacity style={styles.modalButton} onPress={handleAddUserRequest}>
                  <Text style={styles.modalButtonText}>Send Request</Text>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity onPress={() => {
                  setIsAddModalVisible(false);
                  setPhoneNumber("");
                  setIsPhoneFocused(false);
                }}>
                  <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Requests Modal */}
        <Modal visible={isRequestsModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pending Requests</Text>
              {requests.length === 0 ? (
                <Text style={styles.noRequests}>No pending requests</Text>
              ) : (
                <View style={{ flexGrow: 1, width: '100%' }}>
                  <FlatList
                    data={requests}
                    keyExtractor={(item, index) => item.id || item.senderPhone || index.toString()}
                    style={{ maxHeight: 300 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item: user }) => (
                      <View style={styles.requestCard}>
                        <View style={styles.requestInfo}>
                          <Text style={styles.name}>{user.senderName + " " + user.senderLastname}</Text>
                          <Text style={styles.details}>{user.senderPhone}</Text>
                        </View>
                        <View style={styles.requestButtons}>
                          <TouchableOpacity onPress={() => handleAcceptRequest(user)}>
                            <FontAwesome5 name="check" size={24} color="green" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleRejectRequest(user.id)}>
                            <FontAwesome5 name="times" size={24} color="red" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                </View>
              )}

              {/* Always show Close button */}
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity onPress={() => setIsRequestsModalVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
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
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
  },
  requestInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  details: { color: 'gray' },
  requestButtons: { flexDirection: 'column', gap: 10 },
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
    alignSelf: 'center',
  },
  closeText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  leftIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  noRequests: { textAlign: 'center', color: 'gray', marginVertical: 10 },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 7,
    width: 170,
    marginBottom: 10,
  },
  modalButton: { backgroundColor: '#ebebeb', padding: 10, borderRadius: 5, marginTop: 10 },
  modalButtonText: { color: 'gray', fontWeight: 'bold' },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
