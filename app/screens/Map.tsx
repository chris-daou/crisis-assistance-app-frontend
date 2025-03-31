import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Text } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { FontAwesome5 } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY, BACKEND_URL } from '@env';
import io, { Socket } from 'socket.io-client';



const SOCKET_SERVER_URL = `${BACKEND_URL}`;
const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

interface Place {
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
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [hospitals, setHospitals] = useState<Place[]>([]);
  const [shelters, setShelters] = useState<Place[]>([]);
  const [freeFoodOrgs, setFreeFoodOrgs] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  let socket: Socket | null = null;

  useEffect(() => {
    const setupLocationTracking = async () => {
      try {
        // Request foreground permission
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is required to find nearby places.');
          return;
        }
    
        // Request background permission (for iOS and Android)
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Background location access is required for live tracking.');
          return;
        }
    
        // Get user's current location
        const userLocation = await Location.getCurrentPositionAsync({});
        setInitialRegion({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
    
        // Fetch nearby places
        fetchNearbyPlaces(userLocation.coords.latitude, userLocation.coords.longitude);
    
        // Initialize socket connection
        socket = io(SOCKET_SERVER_URL);
        socket.on('connect', () => {
          console.log('Connected to socket server');
        });
    
        // Watch user location for live updates
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Update every 10 meters
          },
          (newLocation) => {
            if (socket) {
              socket.emit('locationUpdate', {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              });
            }
            fetchNearbyPlaces(newLocation.coords.latitude, newLocation.coords.longitude);
          }
        );
    
        setLoading(false);
    
        // Start background location tracking after permission is granted and location is set
        startBackgroundLocationTracking();
      } catch (error) {
        console.error('Error in location setup:', error);
        setLoading(false);
      }
    };
    

    setupLocationTracking();

    // Clean up socket connection on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Function to fetch nearby hospitals, shelters, and free food organizations
  const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
    try {
      const [hospitalsData, sheltersData, freeFoodData] = await Promise.all([
        fetchNearbyHospitals(latitude, longitude),
        fetchNearbyShelters(latitude, longitude),
        fetchNearbyFreeFoodOrgs(latitude, longitude),
      ]);

      setHospitals(hospitalsData);
      setShelters(sheltersData);
      setFreeFoodOrgs(freeFoodData);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const fetchNearbyHospitals = async (latitude: number, longitude: number) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=hospital&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    return data.status === 'OK' ? data.results.filter((place: any) => place.types.includes('hospital')) : [];
  };

  const fetchNearbyShelters = async (latitude: number, longitude: number) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&keyword=shelter&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    return data.status === 'OK' ? data.results : [];
  };

  const fetchNearbyFreeFoodOrgs = async (latitude: number, longitude: number) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=50000&keyword=free+food+charity&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    return data.status === 'OK' ? data.results : [];
  };

  // Function to start background location updates
  const startBackgroundLocationTracking = () => {
    TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
      if (error) {
        console.error('Background location error:', error);
        return;
      }

      const { locations } = data;
      if (locations && locations.length > 0) {
        const { latitude, longitude } = locations[0].coords;
        // Send location update to backend
        if (socket) {
          socket.emit('locationUpdate', { latitude, longitude });
        }
        fetchNearbyPlaces(latitude, longitude);
      }
    });

    Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // Update every minute
      distanceInterval: 10, // Update every 10 meters
      showsBackgroundLocationIndicator: true, // For iOS
    });
  };

  // Show a loading screen until location is retrieved
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
        initialRegion={initialRegion || undefined}
        showsUserLocation={true}
        provider="google"
      >
        {/* Render markers for hospitals, shelters, and free food organizations */}
        {renderMarkers(hospitals, 'hospital')}
        {renderMarkers(shelters, 'home')}
        {renderMarkers(freeFoodOrgs, 'utensils')}
      </MapView>
    </View>
  );
}

// Helper function to render markers for places
const renderMarkers = (places: Place[], iconName: string) => {
  return places.map((place, index) => (
    <Marker key={index} coordinate={{ latitude: place.geometry.location.lat, longitude: place.geometry.location.lng }}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name={iconName} size={24} color="red" />
      </View>
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeVicinity}>{place.vicinity}</Text>
        </View>
      </Callout>
    </Marker>
  ));
};

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
});

