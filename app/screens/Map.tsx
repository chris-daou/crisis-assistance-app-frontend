import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Text, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location'; // Import Expo Location for geolocation
import { GOOGLE_MAPS_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../components/Navigation/Drawer';

interface Place {
  types: any;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  vicinity: string;
}

export default function MapScreen() {
  // --- State Variables ---
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeButton, setActiveButton] = useState<'hospitals' | 'shelters' | 'freeFood' | 'none'>('none');
  const [fetchingInProgress, setFetchingInProgress] = useState(false);

  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  // Map Type state
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  // --- Fetch User Location ---
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const regionData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setInitialRegion(regionData);
      setLoading(false);
    })();
  }, []);

  // --- Fetch Places Once Initial Region is Set ---
  useEffect(() => {
    if (initialRegion) {
      setRegion(initialRegion);
      // Only fetch the places when initial region is available
      if (activeButton !== 'none') {
        fetchPlaces(initialRegion.latitude, initialRegion.longitude);
      }
    }
  }, [initialRegion, activeButton]);  // Now listens to activeButton as well

  // --- Fetch Places Based on Active Button ---
  const fetchPlaces = async (latitude: number, longitude: number) => {
    if (fetchingInProgress) return;
    setFetchingInProgress(true);
    let fetchedPlaces: Place[] = [];

    // Clear previous places to avoid clutter
    setPlaces([]);

    if (activeButton === 'hospitals') {
      fetchedPlaces = await fetchNearbyHospitals(latitude, longitude);
    } else if (activeButton === 'shelters') {
      fetchedPlaces = await fetchNearbyShelters(latitude, longitude);
    } else if (activeButton === 'freeFood') {
      fetchedPlaces = await fetchNearbyFreeFoodOrgs(latitude, longitude);
    }

    setPlaces(fetchedPlaces);
    setFetchingInProgress(false);
  };

  // --- Fetch Nearby Hospitals ---
  const fetchNearbyHospitals = async (latitude: number, longitude: number) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=hospital-hopital&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    return data.status === 'OK'
      ? data.results.filter((place: any) => place.types.includes('hospital'))
      : [];
  };

  // --- Fetch Nearby Shelters ---
  const fetchNearbyShelters = async (latitude: number, longitude: number) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=50000&keyword=Beirut+Shelter&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    return data.status === 'OK' ? data.results : [];
  };

  // --- Fetch Nearby Free Food Organizations ---
  const fetchNearbyFreeFoodOrgs = async (latitude: number, longitude: number) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=50000&keyword=free+food+charity&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    return data.status === 'OK' ? data.results : [];
  };

  // --- Button Press Handler ---
  const handleButtonPress = (button: 'hospitals' | 'shelters' | 'freeFood') => {
    if (activeButton === button) {
      setActiveButton('none');
      setPlaces([]); // Clear places when button is deactivated
    } else {
      setActiveButton(button);
    }
  };

  // --- Recenter Map to User's Location ---
  const recenterMap = () => {
    if (initialRegion) {
      setRegion({
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      fetchPlaces(initialRegion.latitude, initialRegion.longitude);
    }
  };

  // --- Change Map Type ---
  const changeMapType = () => {
    if (mapType === 'standard') {
      setMapType('satellite');
    } else if (mapType === 'satellite') {
      setMapType('hybrid');
    } else {
      setMapType('standard');
    }
  };

  // --- Main Render ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region ?? initialRegion ?? undefined}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        showsUserLocation={true}
        provider="google"
        showsMyLocationButton={false}
        showsBuildings={true}
        toolbarEnabled={false}
        mapType={mapType} // Pass mapType to the MapView
      >
        {renderMarkers(places)}
      </MapView>

      {/* Recenter Button */}
      <View style={styles.recenterButtonContainer}>
        <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
          <FontAwesome5 name="crosshairs" size={25} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Map Type Button */}
      <View style={styles.maptypeButtonContainer}>
        <TouchableOpacity style={styles.recenterButton} onPress={changeMapType}>
          <FontAwesome5 name="layer-group" size={25} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Menu Button */}
      <View style={styles.menuButtonContainer}>
        <TouchableOpacity style={styles.recenterButton} onPress={() => navigation.toggleDrawer()}>
          <FontAwesome5 name="bars" size={25} color="black" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, activeButton === 'hospitals' && styles.activeButton]}
          onPress={() => handleButtonPress('hospitals')}
        >
          <Text style={[styles.buttonText, activeButton === 'hospitals' && styles.activeButtonText]}>
            Hospitals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, activeButton === 'shelters' && styles.activeButton]}
          onPress={() => handleButtonPress('shelters')}
        >
          <Text style={[styles.buttonText, activeButton === 'shelters' && styles.activeButtonText]}>
            Shelters
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, activeButton === 'freeFood' && styles.activeButton]}
          onPress={() => handleButtonPress('freeFood')}
        >
          <Text style={[styles.buttonText, activeButton === 'freeFood' && styles.activeButtonText]}>
            Food Org.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Helper Function to Render Markers ---
const renderMarkers = (places: Place[]) => {
  return places.map((place, index) => {
    let iconName = 'map-marker-alt';
    let iconColor = 'red';

    if (place.types.includes('hospital')) {
      iconName = 'hospital';
      iconColor = 'blue';
    } else if (place.types.includes('shelter')) {
      iconName = 'home';
      iconColor = 'green';
    } else if (place.types.includes('free food')) {
      iconName = 'utensils';
      iconColor = 'orange';
    }

    const openNavigation = () => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}&travelmode=driving`;
      Linking.openURL(url);
    };

    return (
      <Marker key={index} coordinate={{ latitude: place.geometry.location.lat, longitude: place.geometry.location.lng }}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name={iconName} size={24} color={iconColor} />
        </View>
        <Callout tooltip>
          <View style={styles.callout}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeVicinity}>{place.vicinity}</Text>
            <TouchableOpacity style={styles.customNavButton} onPress={openNavigation}>
              <Text style={styles.customNavButtonText}>Navigate Here</Text>
            </TouchableOpacity>
          </View>
        </Callout>
      </Marker>
    );
  });
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: '3%',
    right: '3%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#EBEBEB',
    paddingVertical: 10,
    width: '32%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 55,
  },
  activeButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'gray',
    fontSize: 18,
    textAlign: 'center',
  },
  activeButtonText: {
    color: '#EBEBEB',
  },
  iconContainer: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'red',
  },
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  placeName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  placeVicinity: {
    fontSize: 12,
    color: 'gray',
  },
  customNavButton: {
    marginTop: 10,
    backgroundColor: '#f4f4f4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customNavButtonText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recenterButtonContainer: {
    position: 'absolute',
    top: 30,
    left: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 100,
    padding: 0,
    zIndex: 1,
  },
  maptypeButtonContainer: {
    position: 'absolute',
    top: 90,
    left: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 100,
    padding: 0,
    zIndex: 1,
  },
  menuButtonContainer: {
    position: 'absolute',
    top: 36,
    right: 10,
    borderRadius: 100,
    padding: 0,
    zIndex: 1,
  },
  recenterButton: {
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
