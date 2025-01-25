import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
const logo = require('../assets/logo.png');

export default function SignupForm() {
    const [click, setClick] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);

    const getPhoneValue = () => {
        if (isPhoneFocused || phoneNumber) {
            return `+961${phoneNumber}`; // Show "+961" and user input when focused or input exists
        }
        return ""; // Otherwise, show nothing and allow placeholder
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <SafeAreaView style={styles.container}>
                    <Image source={logo} style={styles.image} resizeMode="contain" />
                    <Text style={styles.title}>Signup</Text>
                    <View style={styles.inputView}>
                        <TextInput style={styles.input} placeholder="First Name" value={username} onChangeText={setUsername} autoCorrect={false} autoCapitalize="none" />
                        <TextInput style={styles.input} placeholder="Last Name" value={username} onChangeText={setUsername} autoCorrect={false} autoCapitalize="none" />
                        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} autoCorrect={false} autoCapitalize="none" />
                        <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={password} onChangeText={setPassword} autoCorrect={false} autoCapitalize="none" />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={isPhoneFocused || phoneNumber ? `+961${phoneNumber}` : ""}
                            onFocus={() => setIsPhoneFocused(true)}
                            onBlur={() => setIsPhoneFocused(false)}
                            onChangeText={(text) => {
                                const prefix = "+961";
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
                        <Pressable style={styles.button} onPress={() => Alert.alert("Signup Successfully!")}>
                            <Text style={styles.buttonText}>SIGNUP</Text>
                        </Pressable>
                    </View>

                    <View style={{ flexGrow: 1 }}></View>

                    {/* Single Text component for both "Already Have Account?" and "Login" */}
                    <Text style={styles.footerText}>
                        Already Have An Account?
                        <Text onPress={() => Alert.alert("Login!")} style={styles.signup}> Login</Text>
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
        paddingVertical: 40,
        color: "red",
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
        borderColor: "red",
        borderWidth: 1,
        borderRadius: 7,
    },
    rememberView: {
        width: "100%",
        paddingHorizontal: 50,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 8,
    },
    switch: {
        flexDirection: "row",
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    rememberText: {
        fontSize: 13,
    },
    forgetText: {
        fontSize: 11,
        color: "red",
    },
    button: {
        backgroundColor: "red",
        height: 45,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "white",
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
        marginBottom: 30,
    },
    signup: {
        color: "red",
        fontSize: 13,
        fontWeight: "bold",
    },
});
