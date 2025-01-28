import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Text } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome5 } from '@expo/vector-icons'; // Using FontAwesome5 for hospital icon
import { GOOGLE_MAPS_API_KEY } from '@env';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  interface Hospital {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    name: string;
    vicinity: string;
  }

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [shelters, setShelters] = useState<Place[]>([]);
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

  const [freeFoodOrgs, setFreeFoodOrgs] = useState<Place[]>([]);
  

  useEffect(() => {
    let locationSubscription: { remove: any } | null = null;

    const requestLocationPermission = async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to find nearby hospitals.');
        setLoading(false);
        return;
      }

      // Get user's current location
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);

      // Set the initial region **only once** to prevent unwanted re-centering
      setInitialRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      // Fetch nearby hospitals
      fetchNearbyHospitals(userLocation.coords.latitude, userLocation.coords.longitude);
      fetchNearbyShelters(userLocation.coords.latitude, userLocation.coords.longitude);
      fetchNearbyFreeFoodOrgs(userLocation.coords.latitude, userLocation.coords.longitude);

      // Start live tracking
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          fetchNearbyHospitals(newLocation.coords.latitude, newLocation.coords.longitude);
        }
      );

      setLoading(false);
    };

    requestLocationPermission();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove(); // Stop tracking when unmounting
      };
    };
  }, []);

  // Function to fetch nearby hospitals using Google Places API
  const fetchNearbyHospitals = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=hopital&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK') {
        // Filter out only hospitals
        const filteredHospitals = data.results.filter((place: { types: string | string[]; }) =>
          place.types.includes('hospital')
        );

        setHospitals(filteredHospitals);
      } else {
        console.error('Google Places API Error:', data.status);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchNearbyShelters = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&keyword=Beirut%20Shelter&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
  
      if (data.status === 'OK') {
        setShelters(data.results);
      } else {
        console.error('Google Places API Error (Shelters):', data.status);
      }
    } catch (error) {
      console.error('Error fetching shelters:', error);
    }
  };
  const fetchNearbyFreeFoodOrgs = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=50000&keyword=free+food+distribution+charity+organization&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
  
      if (data.status === 'OK') {
        setFreeFoodOrgs(data.results);
      } else {
        console.error('Google Places API Error (Free Food):', data.status);
      }
    } catch (error) {
      console.error('Error fetching free food organizations:', error);
    }
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
  {/* Render hospital markers */}
  {hospitals.map((hospital, index) => (
    <Marker
      key={`hospital-${index}`}
      coordinate={{
        latitude: hospital.geometry.location.lat,
        longitude: hospital.geometry.location.lng,
      }}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name="hospital" size={24} color="red" />
      </View>
      <Callout>
        <View style={styles.callout}>
          <FontAwesome5 name="hospital" size={16} color="red" />
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <Text style={styles.hospitalVicinity}>{hospital.vicinity}</Text>
        </View>
      </Callout>
    </Marker>
  ))}

  {/* Render shelter markers */}
  {shelters.map((shelter, index) => (
    <Marker
      key={`shelter-${index}`}
      coordinate={{
        latitude: shelter.geometry.location.lat,
        longitude: shelter.geometry.location.lng,
      }}
    >
      <View style={styles.iconContainerShelter}>
        <FontAwesome5 name="home" size={24} color="blue" />
      </View>
      <Callout>
        <View style={styles.callout}>
          <FontAwesome5 name="home" size={16} color="blue" />
          <Text style={styles.shelterName}>{shelter.name}</Text>
          <Text style={styles.shelterVicinity}>{shelter.vicinity}</Text>
        </View>
      </Callout>
    </Marker>
  ))}

  {/* Render free food organization markers */}
  {freeFoodOrgs.map((org, index) => (
    <Marker
      key={`food-${index}`}
      coordinate={{
        latitude: org.geometry.location.lat,
        longitude: org.geometry.location.lng,
      }}
    >
      <View style={styles.iconContainerFood}>
        <FontAwesome5 name="utensils" size={24} color="green" />
      </View>
      <Callout>
        <View style={styles.callout}>
          <FontAwesome5 name="utensils" size={16} color="green" />
          <Text style={styles.foodOrgName}>{org.name}</Text>
          <Text style={styles.foodOrgVicinity}>{org.vicinity}</Text>
        </View>
      </Callout>
    </Marker>
  ))}
</MapView>


    </View>
  );
}

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
    width: 200, // Adjust width to make it more readable
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  
  hospitalName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  hospitalVicinity: {
    fontSize: 12,
    color: 'gray',
  },
  iconContainerShelter: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'blue', // Different color for shelters
  },
  shelterName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  shelterVicinity: {
    fontSize: 12,
    color: 'gray',
  },
  iconContainerFood: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'green', // Different color for free food organizations
  },
  foodOrgName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  foodOrgVicinity: {
    fontSize: 12,
    color: 'gray',
  },
  
  
});
