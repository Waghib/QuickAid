import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export default function App() {
  // 1. Define a fixed location (e.g., San Francisco)
  const manualLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE} // Force Google Maps
        style={styles.map}
        initialRegion={manualLocation} // Use this for startup location
      >
        {/* 2. Hardcoded Marker */}
        <Marker 
          coordinate={manualLocation}
          title="Test Marker"
          description="If you see this, it works!"
        />

        {/* 3. Hardcoded Polyline (A line nearby) */}
        <Polyline
          coordinates={[
            { latitude: 37.78825, longitude: -122.4324 }, // Start at marker
            { latitude: 37.75825, longitude: -122.4624 }, // End point
          ]}
          strokeColor="red"
          strokeWidth={6}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});