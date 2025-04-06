import React, { useState, useRef, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRoute, RouteProp, useNavigation, NavigationProp } from "@react-navigation/native";
import { AuthStackParamList } from "../../components/Navigation/AuthNavigator";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

type OtpScreenRouteProp = RouteProp<AuthStackParamList, "Otp">;

export default function Otp() {
  const route = useRoute<OtpScreenRouteProp>();
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

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
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

      {otp.join("").length === 6 && (
        <TouchableOpacity style={[styles.button, styles.activeButton]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: "#ebebeb",
  },
  buttonText: {
    color: "gray",
    fontSize: 18,
    fontWeight: "bold",
  },
});
