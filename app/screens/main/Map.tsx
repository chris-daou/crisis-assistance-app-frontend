import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout, CalloutSubview, Region } from 'react-native-maps';
import {
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
// Updated navigation type: import from AppNavigator instead of Drawer
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';
import api from '../../services/api'; // Import Axios instance
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

  // Map Type state
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  // For Android custom callout overlay
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Helper: Wraps button actions so that if a callout is open, it is closed instead.
  const withCalloutCheck = (action: () => void) => {
    return () => {
      if (selectedPlace) {
        setSelectedPlace(null);
        return;
      }
      action();
    };
  };

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
      if (activeButton !== 'none') {
        fetchPlaces(initialRegion.latitude, initialRegion.longitude);
      }
    }
  }, [initialRegion, activeButton]);

  // --- Fetch Places Based on Active Button ---
  const fetchPlaces = async (latitude: number, longitude: number) => {
    if (fetchingInProgress) return;
    setFetchingInProgress(true);
    let fetchedPlaces: Place[] = [];
    setPlaces([]); // Clear previous places

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
    try {
      const response = await api.get('user/geoloc/hospitals', {
        params: { lat: latitude, lng: longitude },
        headers: {
          "user-id": (await AsyncStorage.getItem("user"))?.replace(/"/g, ""),
          Authorization: `Bearer ${(await AsyncStorage.getItem("token"))?.replace(/"/g, "")}`,
        },
      });
      console.log(response.data);
      await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
      // Return the hospitals array from the response; if it isn't there, return an empty array.
      return Array.isArray(response.data.hospitals) ? response.data.hospitals : [];
    } catch (error) {
      await AsyncStorage.setItem("token", JSON.stringify((error as any).response.data.token));
      console.error('Error fetching hospitals:', error);
      return [];
    }
  };

  // --- Fetch Nearby Shelters ---
  const fetchNearbyShelters = async (latitude: number, longitude: number) => {
    try {
      const response = await api.get('user/geoloc/shelters', {
        params: { lat: latitude, lng: longitude },
        headers: {
          "user-id": (await AsyncStorage.getItem("user"))?.replace(/"/g, ""),
          Authorization: `Bearer ${(await AsyncStorage.getItem("token"))?.replace(/"/g, "")}`,
        },
      });
      console.log(response.data);
      // Return the shelters array from the response; if it isn't there, return an empty array.
      await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
      return Array.isArray(response.data.shelters) ? response.data.shelters : [];
    } catch (error) {
      await AsyncStorage.setItem("token", JSON.stringify((error as any).response.data.token));
      console.error('Error fetching shelters:', error);
      return [];
    }
  };

  // --- Fetch Nearby Free Food Organizations ---
  const fetchNearbyFreeFoodOrgs = async (latitude: number, longitude: number) => {
    try {
      const response = await api.get('user/geoloc/food-orgs', {
        params: { lat: latitude, lng: longitude },
        headers: {
          "user-id": (await AsyncStorage.getItem("user"))?.replace(/"/g, ""),
          Authorization: `Bearer ${(await AsyncStorage.getItem("token"))?.replace(/"/g, "")}`,
        },
      });
      console.log(response.data);
      // Return the food orgs array from the response; if it isn't there, return an empty array.
      await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
      return Array.isArray(response.data.foodOrgs) ? response.data.foodOrgs : [];
    } catch (error) {
      await AsyncStorage.setItem("token", JSON.stringify((error as any).response.data.token));
      console.error('Error fetching food orgs:', error);
      return [];
    }
  };

  // --- Filter Button Handler ---
  const handleFilterButtonPress = (button: 'hospitals' | 'shelters' | 'freeFood') => {
    if (selectedPlace) {
      setSelectedPlace(null);
      return;
    }
    if (activeButton === button) {
      setActiveButton('none');
      setPlaces([]); // Clear markers when button is deactivated
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
    setMapType(mapType === 'standard' ? 'hybrid' : 'standard');
  };

  return (
    <View style={styles.container}>
      {/* Always show hamburger menu */}
      <View style={styles.menuButtonContainer}>
        <TouchableOpacity style={styles.hamburgerButton} onPress={withCalloutCheck(() => navigation.toggleDrawer())}>
          <FontAwesome5 name="bars" size={25} color="black" />
        </TouchableOpacity>
      </View>

      {/* Show Map and interactive buttons only when not loading */}
      {!loading && (
        <>
          <MapView
            style={styles.map}
            region={region ?? initialRegion ?? undefined}
            onPress={() => {
              if (selectedPlace) setSelectedPlace(null);
            }}
            onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
            showsUserLocation={true}
            provider="google"
            showsMyLocationButton={false}
            toolbarEnabled={false}
            mapType={mapType}
            showsCompass={false}
            rotateEnabled={false}
          >
            {renderMarkers(places, activeButton, setSelectedPlace)}
          </MapView>

          {/* Android custom overlay for callout */}
          {Platform.OS === 'android' && selectedPlace && (
            <View style={styles.fullOverlay}>
              <TouchableWithoutFeedback onPress={() => setSelectedPlace(null)}>
                <View style={styles.fullOverlayBackground} />
              </TouchableWithoutFeedback>
              <View style={styles.calloutContainer}>
                <TouchableWithoutFeedback onPress={() => { /* Swallow taps */ }}>
                  <View style={styles.customCallout}>
                    <Text style={styles.placeName}>{selectedPlace.name}</Text>
                    <Text style={styles.placeVicinity}>{selectedPlace.vicinity}</Text>
                    <TouchableOpacity
                      style={styles.customNavButton}
                      onPress={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.geometry.location.lat},${selectedPlace.geometry.location.lng}&travelmode=driving`;
                        Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
                      }}
                    >
                      <Text style={styles.customNavButtonText}>Navigate Here</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          )}

          {/* Interactive Buttons */}
          <View style={styles.recenterButtonContainer}>
            <TouchableOpacity style={styles.recenterButton} onPress={withCalloutCheck(recenterMap)}>
              <FontAwesome5 name="crosshairs" size={25} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.maptypeButtonContainer}>
            <TouchableOpacity style={styles.recenterButton} onPress={withCalloutCheck(changeMapType)}>
              <FontAwesome5 name="layer-group" size={25} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, activeButton === 'hospitals' && styles.activeButton]}
              onPress={() => handleFilterButtonPress('hospitals')}
            >
              <Text style={[styles.buttonText, activeButton === 'hospitals' && styles.activeButtonText]}>
                Hospitals
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, activeButton === 'shelters' && styles.activeButton]}
              onPress={() => handleFilterButtonPress('shelters')}
            >
              <Text style={[styles.buttonText, activeButton === 'shelters' && styles.activeButtonText]}>
                Shelters
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, activeButton === 'freeFood' && styles.activeButton]}
              onPress={() => handleFilterButtonPress('freeFood')}
            >
              <Text style={[styles.buttonText, activeButton === 'freeFood' && styles.activeButtonText]}>
                Food Org.
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Show loading indicator overlay if loading */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="gray" />
        </View>
      )}
    </View>
  );
}

// --- Helper Function to Render Markers ---
const renderMarkers = (
  places: Place[],
  activeButton: 'hospitals' | 'shelters' | 'freeFood' | 'none',
  setSelectedPlace: (place: Place) => void
) => {
  return places.map((place, index) => {
    let iconElement;
    if (activeButton === 'hospitals') {
      iconElement = <MaterialCommunityIcons name="hospital-box" size={30} color="#323232" />;
    } else if (activeButton === 'shelters') {
      iconElement = <FontAwesome6 name="person-shelter" size={24} color="#323232" />;
    } else if (activeButton === 'freeFood') {
      iconElement = <MaterialIcons name="food-bank" size={35} color="#323232" />;
    } else {
      iconElement = <MaterialCommunityIcons name="map-marker-alert" size={24} color="#323232" />;
    }

    const openNavigation = () => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}&travelmode=driving`;
      Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
    };

    return (
      <Marker
        key={index}
        coordinate={{
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        }}
        onPress={() => {
          if (Platform.OS === 'android') {
            setSelectedPlace(place);
          }
        }}
      >
        <View>{iconElement}</View>
        {Platform.OS === 'ios' && (
          <Callout tooltip>
            <View style={styles.callout}>
              <View pointerEvents="none">
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeVicinity}>{place.vicinity}</Text>
              </View>
              <CalloutSubview onPress={openNavigation}>
                <TouchableOpacity style={styles.customNavButton}>
                  <Text style={styles.customNavButtonText}>Navigate Here</Text>
                </TouchableOpacity>
              </CalloutSubview>
            </View>
          </Callout>
        )}
      </Marker>
    );
  });
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
  activeButton: { backgroundColor: 'gray' },
  buttonText: { color: 'gray', fontSize: 18, textAlign: 'center' },
  activeButtonText: { color: '#EBEBEB' },
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  placeName: { fontWeight: 'bold', fontSize: 14 },
  placeVicinity: { fontSize: 12, color: 'gray' },
  customNavButton: {
    marginTop: 10,
    backgroundColor: '#f4f4f4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customNavButtonText: { color: 'gray', fontSize: 14, fontWeight: 'bold' },
  recenterButtonContainer: {
    position: 'absolute',
    top: 45,
    left: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 100,
    padding: 0,
    zIndex: 2,
  },
  maptypeButtonContainer: {
    position: 'absolute',
    top: 105,
    left: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 100,
    padding: 0,
    zIndex: 2,
  },
  menuButtonContainer: {
    position: 'absolute',
    top: 36,
    right: 10,
    borderRadius: 100,
    padding: 0,
    zIndex: 3,
  },
  hamburgerButton: {
    padding: 10,
    borderRadius: 30,
  },
  recenterButton: {
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  fullOverlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calloutContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  customCallout: {
    width: '90%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
});
