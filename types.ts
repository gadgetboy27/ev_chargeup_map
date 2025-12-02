export interface Coordinates {
  lat: number;
  lng: number;
}

export enum ChargerStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Charger {
  id: string;
  name: string;
  address: string;
  location: Coordinates;
  operator: string;
  powerKW: number;
  pricePerKwh: number;
  status: ChargerStatus;
  connectors: string[]; // e.g., ["CCS2", "Type 2"]
  discount?: string;
  rating?: number;
}

export interface Session {
  id: string;
  chargerId: string;
  startTime: number;
  kwhDelivered: number;
  currentCost: number;
  isActive: boolean;
  status: 'initializing' | 'charging' | 'completed' | 'error';
}

export interface UserLocation {
  coords: Coordinates;
  loaded: boolean;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingUrls?: Array<{uri: string, title: string}>;
}