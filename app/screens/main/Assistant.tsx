import React, { useState, useEffect } from 'react';
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
import { OPENROUTER_API_KEY } from '@env';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator'; // Adjust path as needed
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Assistant() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

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

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: 'user', content: input }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'Lebanon Crisis App',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.choices?.[0]?.message) {
        console.error('Fetch failed:', data);
        setMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content: 'Sorry, I could not process your request. Please try again later.',
          },
        ]);
      } else {
        const reply = data.choices[0].message;
        setMessages([...updatedMessages, reply]);
      }
    } catch (err) {
      console.error('AI request failed:', err);
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
            style={styles.chat}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length <= 1 && (
              <Text style={styles.placeholderText}>
              Need help with mental health, safety, or an urgent situation in Lebanon? 
              I'm here to support you — just type to begin.
            </Text>
            
            )}
            {messages.slice(1).map((msg, idx) => (
              <View
                key={idx}
                style={[styles.bubble, msg.role === 'user' ? styles.user : styles.assistant]}
              >
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

  chat: { flex: 1, marginBottom: 10,top:50 },
  placeholderText: {
    textAlign: 'center',
    color: 'gray',
    marginVertical: 20,
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
