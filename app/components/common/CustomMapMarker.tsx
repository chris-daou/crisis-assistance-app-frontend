// CustomMapMarker.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  color?: string;
  letter?: string;
}

const CustomMapMarker: React.FC<Props> = ({ color = '#f26552', letter = 'G' }) => {
  return (
    <View style={[styles.markerContainer, { backgroundColor: color }]}>
      <Text style={styles.letter}>{letter}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 40,
    height: 50,
    backgroundColor: '#f26552',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  letter: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    transform: [{ rotate: '-45deg' }],
  },
});

export default CustomMapMarker;
