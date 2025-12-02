import React, { useState, useEffect } from 'react';
import MapComponent from './components/Map.tsx';
import ControlPanel from './components/ControlPanel.tsx';
import ChatAssistant from './components/ChatAssistant.tsx';
import { Charger, Session, UserLocation, Coordinates } from './types';
import { MOCK_CHARGERS } from './constants';
import { Zap } from 'lucide-react';

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation>({
    coords: { lat: 37.7749, lng: -122.4194 }, // Default SF
    loaded: false
  });
  
  const [chargers, setChargers] = useState<Charger[]>(MOCK_CHARGERS);
  const [selectedChargerId, setSelectedChargerId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  // Get User Location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation({ coords, loaded: true });
          // In a real app, fetch chargers near these coords here
          // setChargers(fetchChargers(coords));
          
          // Move mock chargers to user location for demo purposes so the map isn't empty if user isn't in SF
          const latDiff = coords.lat - 37.7749;
          const lngDiff = coords.lng - (-122.4194);
          
          const relocatedChargers = MOCK_CHARGERS.map(c => ({
            ...c,
            location: {
              lat: c.location.lat + latDiff,
              lng: c.location.lng + lngDiff
            }
          }));
          setChargers(relocatedChargers);
        },
        (error) => {
          console.error("Error getting location", error);
          setUserLocation(prev => ({ ...prev, error: error.message, loaded: true }));
        }
      );
    }
  }, []);

  const handleSelectCharger = (charger: Charger) => {
    setSelectedChargerId(charger.id);
  };

  const selectedCharger = chargers.find(c => c.id === selectedChargerId) || null;

  return (
    <div className="relative w-full h-screen bg-gray-900 flex flex-col">
      {/* Header / Brand Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-gray-900/90 backdrop-blur-md p-3 rounded-2xl border border-gray-700 shadow-xl flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl">
          <Zap className="text-white" size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">VoltLink</h1>
          <p className="text-xs text-blue-400">Global Charging Network</p>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative z-0">
        <MapComponent 
          chargers={chargers} 
          userLocation={userLocation.loaded ? userLocation.coords : null}
          selectedChargerId={selectedChargerId}
          onSelectCharger={handleSelectCharger}
        />
      </div>

      {/* Floating Controls */}
      <ChatAssistant userLocation={userLocation.loaded ? userLocation.coords : null} />

      {/* Bottom Panel (Charger Details or Active Session) */}
      <ControlPanel 
        charger={selectedCharger} 
        onClose={() => setSelectedChargerId(null)}
        activeSession={activeSession}
        onSessionStart={setActiveSession}
        onSessionUpdate={setActiveSession}
        onSessionEnd={() => {
            setActiveSession(prev => prev ? {...prev, status: 'completed', isActive: false} : null);
            setTimeout(() => setActiveSession(null), 3000); // clear after delay
        }}
      />
      
      {/* Permission Warning */}
      {!userLocation.loaded && (
         <div className="absolute inset-0 z-[2000] bg-gray-900 flex items-center justify-center">
            <div className="text-center p-6">
                <div className="animate-spin text-blue-500 text-4xl mb-4 mx-auto w-min">⟳</div>
                <h2 className="text-xl font-bold mb-2">Locating...</h2>
                <p className="text-gray-400">Please allow geolocation to find chargers near you.</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default App;