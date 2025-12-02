import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Charger, Coordinates } from '../types';
import { MAP_TILE_LAYER, MAP_ATTRIBUTION } from '../constants';

interface MapProps {
  chargers: Charger[];
  userLocation: Coordinates | null;
  selectedChargerId: string | null;
  onSelectCharger: (charger: Charger) => void;
}

// Component to fly to user location when updated
const LocationMarker = ({ location }: { location: Coordinates | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 14);
    }
  }, [location, map]);

  return location ? (
    <Marker position={[location.lat, location.lng]} icon={
      new L.DivIcon({
        className: 'bg-transparent',
        html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }>
      <Popup>You are here</Popup>
    </Marker>
  ) : null;
};

// Custom Charger Marker Icon
const getChargerIcon = (isSelected: boolean, status: string) => {
  let colorClass = 'bg-green-500';
  if (status === 'BUSY') colorClass = 'bg-orange-500';
  if (status === 'OFFLINE' || status === 'MAINTENANCE') colorClass = 'bg-gray-500';
  
  const size = isSelected ? 'w-8 h-8' : 'w-6 h-6';
  const border = isSelected ? 'border-2 border-white ring-2 ring-blue-400' : 'border border-white';

  return new L.DivIcon({
    className: 'bg-transparent',
    html: `<div class="${colorClass} ${size} rounded-full ${border} shadow-md flex items-center justify-center text-white text-xs font-bold">⚡</div>`,
    iconSize: isSelected ? [32, 32] : [24, 24],
    iconAnchor: isSelected ? [16, 16] : [12, 12]
  });
};

const MapComponent: React.FC<MapProps> = ({ chargers, userLocation, selectedChargerId, onSelectCharger }) => {
  const defaultCenter: [number, number] = [37.7749, -122.4194]; // SF Default
  
  return (
    <MapContainer 
      center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter} 
      zoom={13} 
      scrollWheelZoom={true}
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution={MAP_ATTRIBUTION}
        url={MAP_TILE_LAYER}
      />
      
      <LocationMarker location={userLocation} />

      {chargers.map((charger) => (
        <Marker
          key={charger.id}
          position={[charger.location.lat, charger.location.lng]}
          icon={getChargerIcon(selectedChargerId === charger.id, charger.status)}
          eventHandlers={{
            click: () => onSelectCharger(charger),
          }}
        >
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;