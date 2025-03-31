import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRoute, RouteProp, useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from '../components/Navigation/Drawer';
import api from "../../api";

type OtpScreenRouteProp = RouteProp<RootStackParamList, "Otp">;

export default function Otp() {
  const route = useRoute<OtpScreenRouteProp>(); // Get the phone number from params
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { phone } = route.params as { phone: string };

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      let newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input field if digit is entered
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

    // Simulate API verification request
    try {
      // Replace this with your actual API call
      console.log(`Verifying OTP ${otpCode} for phone ${phone}`);


      const response = await api.post("auth/verifyotp", {
        phone:"+961"+{phone},
        otp:otpCode
        
    });
    if(response.status===200){
        navigation.navigate("Map" as never);
    }
    else{
        Alert.alert("Signup Failed!");
    }


      // Navigate to next screen (Home or Dashboard)
      navigation.navigate("Map" as never);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Invalid OTP, please try again.");
    }
    navigation.navigate("Map" as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter 6-digit OTP</Text>
      <Text style={styles.subtitle}>Sent to {phone}</Text>

      {/* OTP Input Fields */}
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

      {/* Submit Button */}
      <TouchableOpacity style={[styles.button, otp.join("").length === 6 ? styles.activeButton : styles.disabledButton]} onPress={handleSubmit} disabled={otp.join("").length < 6}>
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
