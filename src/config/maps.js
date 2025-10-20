import { GOOGLE_MAPS_API_KEY } from '@env';

export const MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  
  // Map styling options
  mapStyle: [
    // You can add custom map styling here if needed
  ],
  
  // Default map region (Pakistan)
  defaultRegion: {
    latitude: 30.3753,
    longitude: 69.3451,
    latitudeDelta: 10,
    longitudeDelta: 10,
  },
  
  // Map settings
  settings: {
    showsUserLocation: true,
    showsMyLocationButton: true,
    followsUserLocation: true,
    showsCompass: true,
    showsScale: true,
    showsBuildings: true,
    showsTraffic: false,
    showsIndoors: true,
    rotateEnabled: true,
    scrollEnabled: true,
    zoomEnabled: true,
    pitchEnabled: true,
  }
};

// Directions API configuration
export const DIRECTIONS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  baseUrl: 'https://maps.googleapis.com/maps/api/directions/json',
  mode: 'driving', // driving, walking, bicycling, transit
  language: 'en',
  region: 'pk', // Pakistan
};

// Places API configuration
export const PLACES_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  baseUrl: 'https://maps.googleapis.com/maps/api/place',
  language: 'en',
  region: 'pk', // Pakistan
};
