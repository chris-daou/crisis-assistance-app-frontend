import React, { useState, useContext } from 'react';
import { Alert, Image, Pressable, SafeAreaView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
const logo = require('../assets/logo.png');
import { useNavigation, NavigationProp } from '@react-navigation/native';
// If you have an AuthStackParamList defined for your authentication flow, use it here.
import { AuthStackParamList } from '../components/Navigation/AuthNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api';
// Import AuthContext from its new dedicated module
import { AuthContext } from '../components/Navigation/AuthContext';

export default function LoginForm() {
  const [click, setClick] = useState(false);
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const { login } = useContext(AuthContext);

  // Function to handle login
  const handleLogin = async () => {
    try {
      // Simulate a login API call
      console.log("Logging in with:", { phoneNumber, password });
      const response = await api.post("auth/login", {
        phone: "+961" + phoneNumber,
        password
      });
      if (response.status === 200) {
        console.log("Login successful:", response.data);
        await AsyncStorage.setItem('token', JSON.stringify(response.data.accessToken));
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user._id));
        // Instead of navigating to "Home", call login() to update the auth state
        login();
        const savedUser = await AsyncStorage.getItem("token");
        console.log("Saved user:", savedUser);
      } else {
        Alert.alert("Login Failed", response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "An error occurred. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} style={styles.image} resizeMode='contain' />
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputView}>
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
        <TextInput
          style={styles.input}
          placeholder='PASSWORD'
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCorrect={false}
          autoCapitalize='none'
        />
      </View>
      <View style={styles.rememberView}>
        <View style={styles.switch}>
          <Switch value={click} onValueChange={setClick} trackColor={{ true: "green", false: "gray" }} />
          <Text style={styles.rememberText}>Remember Me</Text>
        </View>
        <View>
          <Pressable onPress={() => Alert.alert("Forget Password!")}>
            <Text style={styles.forgetText}>Forgot Password?</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </Pressable>
      </View>
      <View style={{ flexGrow: 1 }}></View>
      <Text style={styles.footerText}>
        Don't Have an Account? 
        <Text onPress={() => navigation.navigate("Signup" as never)} style={styles.signup}> Sign Up</Text>
      </Text>
    </SafeAreaView>
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
    width: 170
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red"
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 7
  },
  rememberView: {
    width: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8
  },
  switch: {
    flexDirection: "row",
    gap: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  rememberText: {
    fontSize: 13
  },
  forgetText: {
    fontSize: 11,
    color: "red"
  },
  button: {
    backgroundColor: "red",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50
  },
  footerText: {
    textAlign: "center",
    color: "gray",
    marginBottom: 30,
  },
  signup: {
    color: "red",
    fontSize: 13,
    fontWeight: "bold"
  }
});
