import React, { useState, useRef } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../components/Navigation/AuthNavigator';

const logo = require('../../assets/images/logo.png');

export default function SignupForm() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [bloodType, setBloodType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(0);

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleDropdownLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;
    setDropdownPosition(y);
  };

  const handleDropdownOpen = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      scrollViewRef.current?.scrollTo({
        y: dropdownPosition - 50 + 300,
        animated: true,
      });
    }
  };

  const handleSignup = async () => {
    if (!firstname || !lastname || !password || !confirmPassword || !phoneNumber || !bloodType) {
      Alert.alert("Please fill all fields!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match!");
      return;
    }
    setFirstname(firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase());
    setLastname(lastname.charAt(0).toUpperCase() + lastname.slice(1).toLowerCase());
    try {
      const response = await api.post("auth/signup", {
        name: firstname,
        lastname,
        password,
        phone: "+961" + phoneNumber,
        bloodType,
      });
      if (response.status === 200) {
        navigation.navigate("Otp", { phone: "+961" + phoneNumber });
      } else {
        Alert.alert("Signup Failed!");
      }
    } catch (error) {
      console.error("❌ Signup Failed:", error);
      Alert.alert("Signup Failed!");
    }
    navigation.navigate("Otp", { phone: "+961" + phoneNumber });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} ref={scrollViewRef} keyboardShouldPersistTaps="handled">
        <SafeAreaView style={styles.container}>
          <Image source={logo} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>Signup</Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstname}
              onChangeText={setFirstname}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastname}
              onChangeText={setLastname}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
              </Pressable>
            </View>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="gray" />
              </Pressable>
            </View>
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
                const validPrefixes = { "3": 6, "70": 6, "71": 6, "76": 6, "78": 6, "79": 6, "81": 6 };
                const isValidPartialPrefix = Object.keys(validPrefixes).some((p) =>
                  p.startsWith(cleanedInput) || cleanedInput.startsWith(p)
                );
                const matchingPrefix = Object.keys(validPrefixes).find((p) => cleanedInput.startsWith(p));
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
            <TouchableOpacity
              style={[styles.input, styles.dropdown]}
              onPress={handleDropdownOpen}
              onLayout={handleDropdownLayout}
            >
              <Text style={[styles.placeholder, bloodType ? styles.selectedText : null]}>
                {bloodType || "Select Blood Type"}
              </Text>
              <MaterialIcons
                name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color="black"
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {bloodTypes.map((type) => (
                  <TouchableOpacity key={type} onPress={() => {
                    setBloodType(type);
                    setIsDropdownOpen(false);
                  }}>
                    <Text style={styles.dropdownItem}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.buttonView}>
            <Pressable style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>SIGNUP</Text>
            </Pressable>
          </View>
          <View style={{ flexGrow: 1 }}></View>
          <Text style={styles.footerText}>
            Already Have An Account?
            <Text onPress={() => navigation.navigate("Login" as never)} style={styles.signup}>
              {" "}Login
            </Text>
          </Text>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 70,
  },
  image: {
    height: 160,
    width: 170,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingBottom: 40,
    color: "gray",
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 7,
    justifyContent: "center",
    backgroundColor: "transparent",
    fontSize: 16,
    color: "black",
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 7,
    height: 50,
    paddingHorizontal: 20,
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  dropdown: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 7,
    marginTop: -10,
  },
  dropdownItem: {
    padding: 15,
    fontSize: 16,
    color: "black",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  arrowIcon: {
    marginLeft: 10,
    color: "black",
  },
  placeholder: {
    color: "gray",
    fontSize: 16,
  },
  selectedText: {
    color: "black",
  },
  button: {
    backgroundColor: "#ebebeb",
    height: 45,
    borderColor: "#ebebeb",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    top: 10,
  },
  buttonText: {
    color: "gray",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
  },
  footerText: {
    textAlign: "center",
    color: "gray",
    marginBottom: 27,
    marginTop: 17,
  },
  signup: {
    color: "gray",
    fontSize: 13,
    fontWeight: "bold",
  },
});