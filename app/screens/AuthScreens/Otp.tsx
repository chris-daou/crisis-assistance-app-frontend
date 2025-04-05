import React, { useState, useRef, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRoute, RouteProp, useNavigation, NavigationProp } from "@react-navigation/native";
// Use the AuthStackParamList from your AuthNavigator
import { AuthStackParamList } from "../../components/Navigation/AuthNavigator";
import api from "../../../api";
import { AuthContext } from "../../components/Navigation/AuthContext";

type OtpScreenRouteProp = RouteProp<AuthStackParamList, "Otp">;

export default function Otp() {
  const route = useRoute<OtpScreenRouteProp>(); // Get the phone number from params
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const { phone } = route.params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  const { login } = useContext(AuthContext);

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      let newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input field if a digit is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      // Move back if deleted
      if (!value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");

    if (otpCode.length < 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit code.");
      return;
    }

    try {
      console.log(`Verifying OTP ${otpCode} for phone ${phone}`);
      const response = await api.post("auth/verifyotp", {
        phone: "+961" + phone,
        otp: otpCode,
      });
      if (response.status === 200) {
        // OTP verified successfully; update auth state
        login();
      } else {
        Alert.alert("OTP Verification Failed!", response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Invalid OTP, please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter 6-digit OTP</Text>
      <Text style={styles.subtitle}>Sent to {phone}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(value) => handleOtpChange(index, value)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          otp.join("").length === 6 ? styles.activeButton : styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={otp.join("").length < 6}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  input: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 5,
  },
  button: {
    marginTop: 20,
    width: "80%",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "red",
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
