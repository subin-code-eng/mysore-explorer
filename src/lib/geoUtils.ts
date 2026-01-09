import { Place } from '@/data/places';

export interface UserLocation {
  lat: number;
  lng: number;
}

// Mysore city center as default
export const MYSORE_CENTER: UserLocation = {
  lat: 12.3052,
  lng: 76.6552,
};

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get places within a specific radius
export function getPlacesWithinRadius<T extends Place>(
  places: T[],
  userLocation: UserLocation,
  radiusKm: number
): (T & { distance: number })[] {
  return places
    .map(place => ({
      ...place,
      distance: calculateDistance(userLocation, place.coordinates),
    }))
    .filter(place => place.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

// Group places by distance brackets
export function groupPlacesByDistance<T extends Place>(
  places: T[],
  userLocation: UserLocation
): {
  within1km: (T & { distance: number })[];
  within2km: (T & { distance: number })[];
  within5km: (T & { distance: number })[];
  beyond5km: (T & { distance: number })[];
} {
  const placesWithDistance = places.map(place => ({
    ...place,
    distance: calculateDistance(userLocation, place.coordinates),
  }));

  return {
    within1km: placesWithDistance.filter(p => p.distance <= 1).sort((a, b) => a.distance - b.distance),
    within2km: placesWithDistance.filter(p => p.distance > 1 && p.distance <= 2).sort((a, b) => a.distance - b.distance),
    within5km: placesWithDistance.filter(p => p.distance > 2 && p.distance <= 5).sort((a, b) => a.distance - b.distance),
    beyond5km: placesWithDistance.filter(p => p.distance > 5).sort((a, b) => a.distance - b.distance),
  };
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

// Check if user is in central congested zone
export function isInCentralZone(location: UserLocation): boolean {
  // Central zone approximately around Mysore Palace
  const centralBounds = {
    north: 12.32,
    south: 12.29,
    east: 76.67,
    west: 76.64,
  };
  
  return (
    location.lat >= centralBounds.south &&
    location.lat <= centralBounds.north &&
    location.lng >= centralBounds.west &&
    location.lng <= centralBounds.east
  );
}

// Get browser geolocation
export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // Default to Mysore center if geolocation fails
        console.warn('Geolocation failed, using Mysore center:', error.message);
        resolve(MYSORE_CENTER);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Zone boundaries for visual representation on map
export const zoneBoundaries = {
  central: {
    center: { lat: 12.3052, lng: 76.6552 },
    radius: 1.5, // km
    color: '#d4a574',
  },
  outer: {
    center: { lat: 12.31, lng: 76.63 },
    radius: 3,
    color: '#9b59b6',
  },
  nature: {
    center: { lat: 12.35, lng: 76.62 },
    radius: 4,
    color: '#27ae60',
  },
  spiritual: {
    center: { lat: 12.28, lng: 76.67 },
    radius: 2,
    color: '#e67e22',
  },
};
