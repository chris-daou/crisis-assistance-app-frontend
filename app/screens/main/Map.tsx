// src/screens/main/MapScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
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
import MapView, { Marker, Callout, CalloutSubview, Region, Circle } from 'react-native-maps';
import { FontAwesome5, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SocketService from '../../services/socket';
import CustomMapMarker from '../../components/common/CustomMapMarker';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';

interface Place {
  types: any;
  geometry: { location: { lat: number; lng: number } };
  name: string;
  vicinity: string;
}

interface DangerZone {
  id: string;
  center: { latitude: number; longitude: number };
  radius: number;
}

interface FriendLocation {
  userId: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

export default function MapScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeButton, setActiveButton] = useState<'hospitals' | 'shelters' | 'freeFood' | 'none'>('none');
  const [fetchingInProgress, setFetchingInProgress] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [friendLocations, setFriendLocations] = useState<FriendLocation[]>([]);

  // 1) Get user location & danger zones
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
      setRegion(regionData);
      setLoading(false);

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
      } catch (err) {
        console.error('Error fetching danger zones:', err);
      }
    })();
  }, []);

  // 2) Socket.io setup + initial friends
  useEffect(() => {
    let isMounted = true;
    (async () => {
      await SocketService.init();

      // listen for real-time updates
      SocketService.on<{ userId: string; lat: number; lng: number }>(
        'locationUpdate',
        upd => {
          if (!isMounted) return;
          setFriendLocations(current =>
            current.map(f =>
              f.userId === upd.userId
                ? { ...f, lat: upd.lat, lng: upd.lng }
                : f
            )
          );
        }
      );

      // fetch initial connected friends
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      try {
        const resp = await api.get<FriendLocation[]>('user/connections', {
          headers: { 'user-id': userId, Authorization: `Bearer ${token}` }
        });
        const withColor = resp.data.map(f => ({
          ...f,
          color: `hsl(${Math.floor(Math.random()*360)},70%,80%)`
        }));
        if (isMounted) setFriendLocations(withColor);
      } catch (err) {
        console.error('Error fetching connections:', err);
      }
    })();
    return () => { isMounted = false; SocketService.disconnect(); };
  }, []);

  // 3) Emit own location every 5s
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (initialRegion) {
      interval = setInterval(async () => {
        const loc = await Location.getCurrentPositionAsync({});
        const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
        SocketService.emit('updateLocation', {
          userId,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [initialRegion]);

  // POI Fetchers...
  const fetchPlaces = async (lat: number, lng: number) => {
    if (fetchingInProgress) return;
    setFetchingInProgress(true);
    setPlaces([]);
    let fetched: Place[] = [];
    if (activeButton === 'hospitals') fetched = await fetchNearby('hospitals', lat, lng);
    if (activeButton === 'shelters') fetched = await fetchNearby('shelters', lat, lng);
    if (activeButton === 'freeFood') fetched = await fetchNearby('food-orgs', lat, lng);
    setPlaces(fetched);
    setFetchingInProgress(false);
  };

  const fetchNearby = async (endpoint: string, lat: number, lng: number) => {
    try {
      const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';
      const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
      const resp = await api.get(`user/geoloc/${endpoint}`, {
        params: { lat, lng },
        headers: { 'user-id': userId, Authorization: `Bearer ${token}` },
      });
      if (resp.data.token) await AsyncStorage.setItem('token', JSON.stringify(resp.data.token));
      return Array.isArray(resp.data[endpoint === 'food-orgs' ? 'foodOrgs' : endpoint])
        ? resp.data[endpoint === 'food-orgs' ? 'foodOrgs' : endpoint]
        : [];
    } catch {
      return [];
    }
  };

  const handleFilterButtonPress = (btn: 'hospitals' | 'shelters' | 'freeFood') => {
    if (selectedPlace) { setSelectedPlace(null); return; }
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

  const changeMapType = () => setMapType(mapType === 'standard' ? 'hybrid' : 'standard');

  if (loading || !region) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={r => setRegion(r)}
        showsUserLocation
        provider="google"
        mapType={mapType}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        showsCompass={false}
        rotateEnabled={false}
      >
        {dangerZones.map(z => (
          <Circle
            key={z.id}
            center={z.center}
            radius={z.radius}
            fillColor="rgba(255,0,0,0.2)"
            strokeColor="rgba(255,0,0,0.5)"
          />
        ))}

        {/* POI markers */}
        {places.map((place, i) => {
          const coords = { latitude: place.geometry.location.lat, longitude: place.geometry.location.lng };
          let icon;
          if (activeButton === 'hospitals') icon = <MaterialCommunityIcons name="hospital-box" size={30} color="#323232" />;
          if (activeButton === 'shelters') icon = <FontAwesome6 name="person-shelter" size={24} color="#323232" />;
          if (activeButton === 'freeFood') icon = <MaterialIcons name="food-bank" size={35} color="#323232" />;
          return (
            <Marker key={i} coordinate={coords} onPress={() => Platform.OS==='android' && setSelectedPlace(place)}>
              <View>{icon}</View>
              {Platform.OS==='ios' && (
                <Callout tooltip>
                  <View style={styles.callout}>
                    <View pointerEvents="none">
                      <Text style={styles.placeName}>{place.name}</Text>
                      <Text style={styles.placeVicinity}>{place.vicinity}</Text>
                    </View>
                    <CalloutSubview onPress={() => Linking.openURL(
                      `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}&travelmode=driving`
                    )}>
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

        {/* Friend markers */}
        {friendLocations.map(f => (
          <Marker
            key={f.userId}
            coordinate={{ latitude: f.lat, longitude: f.lng }}
          >
            <CustomMapMarker color={f.color} letter={f.name.charAt(0).toUpperCase()} />
          </Marker>
        ))}
      </MapView>

      {/* Menu button */}
      <View style={styles.menuButtonContainer}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          <FontAwesome5 name="bars" size={25} color="black" />
        </TouchableOpacity>
      </View>

      {/* Controls */}
      <View style={styles.recenterButtonContainer}>
        <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
          <FontAwesome5 name="crosshairs" size={25} color="gray" />
        </TouchableOpacity>
      </View>
      <View style={styles.maptypeButtonContainer}>
        <TouchableOpacity style={styles.recenterButton} onPress={changeMapType}>
          <FontAwesome5 name="layer-group" size={25} color="gray" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        {(['hospitals','shelters','freeFood'] as const).map(btn => (
          <TouchableOpacity
            key={btn}
            style={[styles.button, activeButton===btn && styles.activeButton]}
            onPress={() => handleFilterButtonPress(btn)}
          >
            <Text style={[styles.buttonText, activeButton===btn && styles.activeButtonText]}>
              {btn === 'freeFood' ? 'Food Org.' : btn.charAt(0).toUpperCase()+btn.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  map:        { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  buttonContainer: {
    position: 'absolute', bottom: 10, left: '3%', right: '3%',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  button: {
    backgroundColor: '#EBEBEB', paddingVertical: 10, width: '32%',
    borderRadius: 25, alignItems: 'center', justifyContent: 'center', bottom: 55,
  },
  activeButton:    { backgroundColor: 'gray' },
  buttonText:      { color: 'gray', fontSize: 18, textAlign: 'center' },
  activeButtonText:{ color: '#EBEBEB' },

  callout:        { width:200, padding:10, backgroundColor:'white', borderRadius:10, alignItems:'center' },
  placeName:      { fontWeight:'bold', fontSize:14 },
  placeVicinity:  { fontSize:12, color:'gray' },
  customNavButton:{ marginTop:10, backgroundColor:'#f4f4f4', paddingVertical:10, paddingHorizontal:20, borderRadius:30 },
  customNavButtonText:{ color:'gray', fontSize:14, fontWeight:'bold' },

  recenterButtonContainer: { position:'absolute', top:45, left:10, backgroundColor:'#F4F4F4', borderRadius:100, zIndex:2 },
  maptypeButtonContainer:  { position:'absolute', top:105,left:10, backgroundColor:'#F4F4F4', borderRadius:100, zIndex:2 },
  menuButtonContainer:      { position:'absolute', top:36, right:10, borderRadius:100, zIndex:3 },
  recenterButton:           { padding:10, borderRadius:30, alignItems:'center', justifyContent:'center' },

  fullOverlay:            { position:'absolute', top:0,left:0,right:0,bottom:0, zIndex:2 },
  fullOverlayBackground:  { flex:1, backgroundColor:'rgba(0,0,0,0.5)' },
  calloutContainer:       { position:'absolute', bottom:120, left:20, right:20, alignItems:'center' },
  customCallout:          { width:'90%', padding:15, backgroundColor:'white', borderRadius:10, alignItems:'center', elevation:5 },
});
