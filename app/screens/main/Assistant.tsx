import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AssistantScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the assistant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
});
