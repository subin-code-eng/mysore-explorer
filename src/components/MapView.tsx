import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Place, CrowdLevel } from '@/data/places';
import { UserLocation, MYSORE_CENTER, formatDistance } from '@/lib/geoUtils';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Route, X, AlertTriangle } from 'lucide-react';

interface MapViewProps {
  places: (Place & { crowdStatus: { level: CrowdLevel; percentage: number }; distance?: number })[];
  userLocation: UserLocation | null;
  onSelectPlace: (place: Place & { crowdStatus: { level: CrowdLevel; percentage: number } }) => void;
  selectedPlace?: Place | null;
  showRoute?: boolean;
  onClose?: () => void;
  mapboxToken: string;
}

const crowdColors: Record<CrowdLevel, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
};

export function MapView({
  places,
  userLocation,
  onSelectPlace,
  selectedPlace,
  showRoute,
  onClose,
  mapboxToken,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [avoidCentral, setAvoidCentral] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation?.lng || MYSORE_CENTER.lng, userLocation?.lat || MYSORE_CENTER.lat],
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker
    if (userLocation) {
      new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Location</strong>'))
        .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add place markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    places.forEach(place => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${crowdColors[place.crowdStatus.level]};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      `;
      el.innerHTML = `<span style="color: white; font-size: 12px; font-weight: bold;">${place.crowdStatus.percentage}</span>`;
      el.onmouseenter = () => el.style.transform = 'scale(1.2)';
      el.onmouseleave = () => el.style.transform = 'scale(1)';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <strong style="font-size: 14px;">${place.name}</strong>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">${place.description}</p>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px;">
            <span style="
              background: ${crowdColors[place.crowdStatus.level]}20;
              color: ${crowdColors[place.crowdStatus.level]};
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
            ">${place.crowdStatus.level.toUpperCase()} CROWD</span>
            ${place.distance !== undefined ? `<span style="font-size: 11px; color: #888;">${formatDistance(place.distance)}</span>` : ''}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.coordinates.lng, place.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.onclick = () => onSelectPlace(place);

      markersRef.current.push(marker);
    });
  }, [places, onSelectPlace]);

  // Draw route when selected
  useEffect(() => {
    if (!map.current || !showRoute || !selectedPlace || !userLocation || !mapboxToken) return;

    const fetchRoute = async () => {
      const avoidCoords = avoidCentral 
        ? '&exclude=point(76.6552 12.3052)' 
        : '';
      
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.lng},${userLocation.lat};${selectedPlace.coordinates.lng},${selectedPlace.coordinates.lat}?geometries=geojson&overview=full&steps=true&access_token=${mapboxToken}${avoidCoords}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const routeGeoJSON = route.geometry;

          // Remove existing route layer
          if (map.current?.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
          }

          // Add new route
          map.current?.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeGeoJSON,
            },
          });

          map.current?.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': avoidCentral ? '#22c55e' : '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.8,
            },
          });

          // Update route info
          setRouteInfo({
            distance: (route.distance / 1000).toFixed(1) + ' km',
            duration: Math.round(route.duration / 60) + ' min',
          });

          // Fit map to route
          const coordinates = routeGeoJSON.coordinates;
          const bounds = coordinates.reduce(
            (bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
              return bounds.extend(coord);
            },
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          );

          map.current?.fitBounds(bounds, { padding: 50 });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [showRoute, selectedPlace, userLocation, avoidCentral, mapboxToken]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-full rounded-xl overflow-hidden"
    >
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-card rounded-lg shadow-lg hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Route Options */}
      {showRoute && selectedPlace && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-card rounded-xl shadow-elevated p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="text-primary" size={20} />
                <span className="font-semibold">Route to {selectedPlace.name}</span>
              </div>
              {routeInfo && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{routeInfo.distance}</span>
                  <span>•</span>
                  <span>{routeInfo.duration}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setAvoidCentral(!avoidCentral)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                avoidCentral
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Route size={16} />
              {avoidCentral ? '✓ Avoiding Central Zone (Decentralised Route)' : 'Use Decentralised Route (Avoid Central Zone)'}
            </button>

            {avoidCentral && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <AlertTriangle size={12} />
                Route avoids congested central heritage zone
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-16 z-10 bg-card/95 backdrop-blur rounded-lg shadow-lg p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Crowd Level</p>
        <div className="flex flex-col gap-1">
          {(['low', 'medium', 'high'] as CrowdLevel[]).map(level => (
            <div key={level} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: crowdColors[level] }}
              />
              <span className="text-xs capitalize">{level}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
