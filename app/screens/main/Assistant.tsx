import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function Assistant() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

  // Initial system message
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: `
You are an empathetic assistant designed to help users in Lebanon experiencing crisis situations, including mental health struggles, safety threats, and emergencies.

Maintain a friendly, conversational tone. It's okay to greet the user and acknowledge their message casually.

If the user asks unrelated questions (e.g., about sports, trivia, technology), politely redirect them by saying something like:

"I'm here to support you with mental health, safety, or emergency-related concerns. Let me know how I can help."

Focus on empathy, reassurance, and helpfulness.
      `.trim(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // SESSION MANAGEMENT: sessionId is stored in component state.
  // It starts as null and gets updated once the backend sends it.
  const [sessionId, setSessionId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: 'user', content: input }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Session ID is now sent as query parameters in the config.
      console.log('Session ID:', sessionId);
      const response = await api.post(
        'user/assistant/chat-reply',
        { messages: updatedMessages }, // only messages go in the body
        {
          params: { sessionId }, // sessionId sent in query string
          headers: {
            'user-id': (await AsyncStorage.getItem('user'))?.replace(/"/g, ''),
            Authorization: `Bearer ${(await AsyncStorage.getItem('token'))?.replace(/"/g, '')}`,
          },
          // Treat any status code below 500 as a successful response
          validateStatus: (status) => status < 500,
        }
      );

      console.log(response.data);
      // Update token if present
      if (response.data.token) {
        await AsyncStorage.setItem('token', JSON.stringify(response.data.token));
      }

      // Save sessionId if provided by the backend
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }

      const data = response.data;
      // Check for the new structure with "reply", or fallback to the previous structure.
      if (data?.reply) {
        setMessages([...updatedMessages, data.reply]);
      } else if (data?.choices?.[0]?.message) {
        setMessages([...updatedMessages, data.choices[0].message]);
      } else {
        console.error('Fetch failed:', data);
        setMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content: 'Sorry, I could not process your request. Please try again later.',
          },
        ]);
      }
    } catch (error: any) {
      if (error?.response?.data?.token) {
        await AsyncStorage.setItem('token', JSON.stringify(error.response.data.token));
      }
      console.error('Error accepting request:', error.response?.data || error);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'A network or server error occurred. Please try again later.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    // Reset chat and clear the sessionId
    setSessionId(null);
    setMessages([
      {
        role: 'system',
        content: messages[0].content,
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.container}>
          {/* Header Buttons */}
          <View>
            <TouchableOpacity style={styles.resetButtonContainer} onPress={resetChat}>
              <FontAwesome5 name="redo" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButtonContainer} onPress={() => navigation.toggleDrawer()}>
              <FontAwesome5 name="bars" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={[styles.chat, { marginBottom: keyboardVisible ? 50 : 100 }]}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingBottom: 10 }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length <= 1 && (
              <Text style={styles.placeholderText}>
                Need help with mental health, safety, or an urgent situation in Lebanon? 
                I'm here to support you — just type to begin.
              </Text>
            )}
            {messages.slice(1).map((msg, idx) => (
              <View key={idx} style={[styles.bubble, msg.role === 'user' ? styles.user : styles.assistant]}>
                <Text style={styles.text}>{msg.content || '[empty]'}</Text>
              </View>
            ))}
            {loading && (
              <Text style={{ textAlign: 'center', color: 'gray', marginTop: 10 }}>
                Thinking...
              </Text>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={[styles.inputContainer, { bottom: keyboardVisible ? 0 : 60 }]}>
            <TextInput
              placeholder="Ask something..."
              style={styles.input}
              value={input}
              onChangeText={setInput}
            />
            <Pressable style={styles.button} onPress={sendMessage} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? '...' : 'Send'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 },
  resetButtonContainer: {
    position: 'absolute',
    padding: 8,
    borderRadius: 6,
    marginLeft: 5,
    top: 11,
  },
  menuButtonContainer: {
    position: 'absolute',
    padding: 8,
    borderRadius: 6,
    marginRight: 5,
    right: -2,
    top: 11,
  },
  chat: {
    flex: 1,
    top: 50,
  },
  placeholderText: {
    textAlign: 'center',
    color: 'gray',
    marginVertical: 250,
  },
  bubble: {
    marginVertical: 6,
    padding: 10,
    borderRadius: 8,
    maxWidth: '85%',
  },
  user: { alignSelf: 'flex-end', backgroundColor: '#ebebeb' },
  assistant: { alignSelf: 'flex-start', backgroundColor: '#f2f2f2' },
  text: { color: '#333', fontSize: 15 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 5,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  input: { flex: 1, height: 40, paddingHorizontal: 10 },
  button: {
    backgroundColor: '#ebebeb',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 5,
  },
  buttonText: { color: 'gray', fontWeight: 'bold' },
});
