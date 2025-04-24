// src/components/common/CustomMapMarker.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  color?: string;
  letter?: string;
}

const CustomMapMarker: React.FC<Props> = ({
  color = '#f26552',
  letter = 'G',
}) => (
  <View style={styles.markerContainer}>
    {/* Pin head */}
    <View style={[styles.circle, { backgroundColor: color }]}>
      <Text style={styles.letter}>{letter}</Text>
    </View>
    {/* Pin tail */}
    <View style={[styles.triangle, { borderTopColor: color }]} />
  </View>
);

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  circle: {
    width:  30,
    height:  30,
    borderRadius:  15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    top: -5,
    // borderTopColor gets set via props
  },
});

// numeric constants
const ten = 10;
const fifteen = 15;
const thirty = 30;
const eighteen = 18;

export default CustomMapMarker;
