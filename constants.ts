import { Charger, ChargerStatus } from "./types";
import L from 'leaflet';

// Fix for default Leaflet markers in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

export const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export const MAP_TILE_LAYER = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Mock Chargers to display initially around a central point (Example: San Francisco)
// In a real app, these would come from an API based on viewport
export const MOCK_CHARGERS: Charger[] = [
  {
    id: 'ch_001',
    name: 'Metropolis SuperHub',
    address: '123 Tech Plaza, Downtown',
    location: { lat: 37.7749, lng: -122.4194 },
    operator: 'VoltNet',
    powerKW: 150,
    pricePerKwh: 0.45,
    status: ChargerStatus.AVAILABLE,
    connectors: ['CCS2', 'CHAdeMO'],
    rating: 4.8
  },
  {
    id: 'ch_002',
    name: 'GreenEnergy Station 4',
    address: '450 Market St',
    location: { lat: 37.7895, lng: -122.4010 },
    operator: 'GreenCharge',
    powerKW: 50,
    pricePerKwh: 0.35,
    status: ChargerStatus.BUSY,
    connectors: ['Type 2', 'CCS2'],
    discount: '10% off for members'
  },
  {
    id: 'ch_003',
    name: 'EcoPark Garage',
    address: '800 Mission St',
    location: { lat: 37.7845, lng: -122.4070 },
    operator: 'VoltNet',
    powerKW: 350,
    pricePerKwh: 0.55,
    status: ChargerStatus.AVAILABLE,
    connectors: ['CCS2'],
    rating: 4.9
  },
  {
    id: 'ch_004',
    name: 'Westside Mall Charging',
    address: '1500 Van Ness Ave',
    location: { lat: 37.7900, lng: -122.4200 },
    operator: 'ChargePoint',
    powerKW: 22,
    pricePerKwh: 0.25,
    status: ChargerStatus.MAINTENANCE,
    connectors: ['Type 2'],
  }
];

export const APP_NAME = "VoltLink";
export const SERVICE_FEE_PERCENT = 0.05; // 5% service fee