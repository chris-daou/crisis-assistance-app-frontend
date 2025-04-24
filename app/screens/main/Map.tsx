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
import MapView, {
  Marker,
  Callout,
  CalloutSubview,
  Region,
  Circle,
} from 'react-native-maps';
import {
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Place {
  types: any;
  geometry: {
    location: { lat: number; lng: number };
  };
  name: string;
  vicinity: string;
}

interface DangerZone {
  id: string;
  center: { latitude: number; longitude: number };
  radius: number;
}

export default function MapScreen() {
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeButton, setActiveButton] = useState<'hospitals' | 'shelters' | 'freeFood' | 'none'>('none');
  const [fetchingInProgress, setFetchingInProgress] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const withCalloutCheck = (action: () => void) => () => {
    if (selectedPlace) {
      setSelectedPlace(null);
      return;
    }
    action();
  };

  // Fetch location & danger zones
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access was denied');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const regionData: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setInitialRegion(regionData);
      setLoading(false);

      // --- FIXED: pull from dangerZones & use _id for key
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      try {
        const resp = await api.get('user/geoloc/danger-zones', {
          params: { lat: regionData.latitude, lng: regionData.longitude },
          headers: { 'user-id': userId, Authorization: `Bearer ${token}` },
        });
        const zones: DangerZone[] = resp.data.dangerZones.map((z: any) => ({
          id: z._id,
          center: { latitude: z.lat, longitude: z.lng },
          radius: z.radius,
        }));
        setDangerZones(zones);
        if (resp.data.token) {
          await AsyncStorage.setItem('token', JSON.stringify(resp.data.token));
        }
      } catch (err) {
        console.error('Error fetching danger zones:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (initialRegion) {
      setRegion(initialRegion);
      if (activeButton !== 'none') {
        fetchPlaces(initialRegion.latitude, initialRegion.longitude);
      }
    }
  }, [initialRegion, activeButton]);

  // Place‐fetchers (unchanged)…
  const fetchPlaces = async (lat: number, lng: number) => {
    if (fetchingInProgress) return;
    setFetchingInProgress(true);
    setPlaces([]);

    let fetched: Place[] = [];
    if (activeButton === 'hospitals') fetched = await fetchNearbyHospitals(lat, lng);
    else if (activeButton === 'shelters') fetched = await fetchNearbyShelters(lat, lng);
    else if (activeButton === 'freeFood') fetched = await fetchNearbyFreeFoodOrgs(lat, lng);

    setPlaces(fetched);
    setFetchingInProgress(false);
  };

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    try {
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const resp = await api.get('user/geoloc/hospitals', {
        params: { lat, lng },
        headers: { 'user-id': userId, Authorization: `Bearer ${token}` },
      });
      if (resp.data.token) await AsyncStorage.setItem('token', JSON.stringify(resp.data.token));
      return Array.isArray(resp.data.hospitals) ? resp.data.hospitals : [];
    } catch {
      return [];
    }
  };

  const fetchNearbyShelters = async (lat: number, lng: number) => {
    try {
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const resp = await api.get('user/geoloc/shelters', {
        params: { lat, lng },
        headers: { 'user-id': userId, Authorization: `Bearer ${token}` },
      });
      if (resp.data.token) await AsyncStorage.setItem('token', JSON.stringify(resp.data.token));
      return Array.isArray(resp.data.shelters) ? resp.data.shelters : [];
    } catch {
      return [];
    }
  };

  const fetchNearbyFreeFoodOrgs = async (lat: number, lng: number) => {
    try {
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const resp = await api.get('user/geoloc/food-orgs', {
        params: { lat, lng },
        headers: { 'user-id': userId, Authorization: `Bearer ${token}` },
      });
      if (resp.data.token) await AsyncStorage.setItem('token', JSON.stringify(resp.data.token));
      return Array.isArray(resp.data.foodOrgs) ? resp.data.foodOrgs : [];
    } catch {
      return [];
    }
  };

  const handleFilterButtonPress = (btn: 'hospitals' | 'shelters' | 'freeFood') => {
    if (selectedPlace) {
      setSelectedPlace(null);
      return;
    }
    if (activeButton === btn) {
      setActiveButton('none');
      setPlaces([]);
    } else {
      setActiveButton(btn);
    }
  };

  const recenterMap = () => {
    if (!initialRegion) return;
    setRegion({ ...initialRegion });
    fetchPlaces(initialRegion.latitude, initialRegion.longitude);
  };

  const changeMapType = () => {
    setMapType(mapType === 'standard' ? 'hybrid' : 'standard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuButtonContainer}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={withCalloutCheck(() => navigation.toggleDrawer())}
        >
          <FontAwesome5 name="bars" size={25} color="black" />
        </TouchableOpacity>
      </View>

      {!loading && (
        <>
          <MapView
            style={styles.map}
            region={region ?? initialRegion ?? undefined}
            onPress={() => selectedPlace && setSelectedPlace(null)}
            onRegionChangeComplete={r => setRegion(r)}
            showsUserLocation
            provider="google"
            showsMyLocationButton={false}
            toolbarEnabled={false}
            mapType={mapType}
            showsCompass={false}
            rotateEnabled={false}
          >
            {/* Danger Zones */}
            {dangerZones.map(zone => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                fillColor="rgba(255,0,0,0.2)"
                strokeColor="rgba(255,0,0,0.5)"
              />
            ))}

            {/* POI Markers */}
            {places.map((place, idx) => {
              let icon;
              if (activeButton === 'hospitals')
                icon = <MaterialCommunityIcons name="hospital-box" size={30} color="#323232" />;
              else if (activeButton === 'shelters')
                icon = <FontAwesome6 name="person-shelter" size={24} color="#323232" />;
              else if (activeButton === 'freeFood')
                icon = <MaterialIcons name="food-bank" size={35} color="#323232" />;
              else
                icon = <MaterialCommunityIcons name="map-marker-alert" size={24} color="#323232" />;

              const coords = {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              };

              const openNav = () => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}&travelmode=driving`;
                Linking.openURL(url).catch(console.error);
              };

              return (
                <Marker
                  key={idx}
                  coordinate={coords}
                  onPress={() => Platform.OS === 'android' && setSelectedPlace(place)}
                >
                  <View>{icon}</View>
                  {Platform.OS === 'ios' && (
                    <Callout tooltip>
                      <View style={styles.callout}>
                        <View pointerEvents="none">
                          <Text style={styles.placeName}>{place.name}</Text>
                          <Text style={styles.placeVicinity}>{place.vicinity}</Text>
                        </View>
                        <CalloutSubview onPress={openNav}>
                          <TouchableOpacity style={styles.customNavButton}>
                            <Text style={styles.customNavButtonText}>Navigate Here</Text>
                          </TouchableOpacity>
                        </CalloutSubview>
                      </View>
                    </Callout>
                  )}
                </Marker>
              );
            })}
          </MapView>

          {/* Android custom callout overlay */}
          {Platform.OS === 'android' && selectedPlace && (
            <View style={styles.fullOverlay}>
              <TouchableWithoutFeedback onPress={() => setSelectedPlace(null)}>
                <View style={styles.fullOverlayBackground} />
              </TouchableWithoutFeedback>
              <View style={styles.calloutContainer}>
                <View style={styles.customCallout}>
                  <Text style={styles.placeName}>{selectedPlace.name}</Text>
                  <Text style={styles.placeVicinity}>{selectedPlace.vicinity}</Text>
                  <TouchableOpacity
                    style={styles.customNavButton}
                    onPress={() => {
                      const { lat, lng } = selectedPlace.geometry.location;
                      Linking.openURL(
                        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
                      ).catch(console.error);
                    }}
                  >
                    <Text style={styles.customNavButtonText}>Navigate Here</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Controls */}
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

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="gray" />
        </View>
      )}
    </View>
  );
}

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
    zIndex: 2,
  },
  maptypeButtonContainer: {
    position: 'absolute',
    top: 105,
    left: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 100,
    zIndex: 2,
  },
  menuButtonContainer: {
    position: 'absolute',
    top: 36,
    right: 10,
    borderRadius: 100,
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
