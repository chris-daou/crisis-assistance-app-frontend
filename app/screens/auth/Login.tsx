import React, { useState, useContext } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
const logo = require('../../assets/images/logo.png');
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../components/Navigation/AuthNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Feather } from '@expo/vector-icons';

export default function LoginForm() {
  const [click, setClick] = useState(false);
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const response = await api.post("auth/login", {
        phone: "+961" + phoneNumber,
        password
      });
      if (response.status === 200) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.accessToken));
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user._id));
        login();
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
      </View>
      <View style={styles.rememberView}>
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
    color: "gray"
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
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 7
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
  rememberView: {
    width: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8
  },
  forgetText: {
    fontSize: 11,
    color: "gray",
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#ebebeb",
    height: 45,
    borderColor: "#ebebeb",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "gray",
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
    color: "gray",
    fontSize: 13,
    fontWeight: "bold"
  }
});