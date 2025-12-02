import React, { useState, useEffect } from 'react';
import { Charger, Session, ChargerStatus } from '../types';
import { Zap, MapPin, CreditCard, Clock, Play, Square, AlertCircle, CheckCircle } from 'lucide-react';
import { startRemoteSession } from '../services/geminiService';
import { SERVICE_FEE_PERCENT } from '../constants';

interface ControlPanelProps {
  charger: Charger | null;
  onClose: () => void;
  activeSession: Session | null;
  onSessionStart: (session: Session) => void;
  onSessionUpdate: (session: Session) => void;
  onSessionEnd: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  charger, 
  onClose, 
  activeSession, 
  onSessionStart, 
  onSessionUpdate,
  onSessionEnd
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock session progress
  useEffect(() => {
    let interval: any;
    if (activeSession && activeSession.status === 'charging') {
      interval = setInterval(() => {
        const addedKwh = 0.1; // simulate speed
        const newKwh = activeSession.kwhDelivered + addedKwh;
        const newCost = activeSession.currentCost + (addedKwh * (charger?.pricePerKwh || 0.40));
        
        onSessionUpdate({
          ...activeSession,
          kwhDelivered: newKwh,
          currentCost: newCost
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, charger, onSessionUpdate]);

  const handleStartCharge = async () => {
    if (!charger) return;
    setLoading(true);
    setError(null);
    try {
      const response = await startRemoteSession(charger.id, "USER_VEHICLE_01");
      
      if (response.status === 'ACCEPTED') {
        const newSession: Session = {
          id: response.sessionId,
          chargerId: charger.id,
          startTime: Date.now(),
          kwhDelivered: 0,
          currentCost: 0,
          isActive: true,
          status: 'charging'
        };
        onSessionStart(newSession);
      } else {
        setError(response.message || "Charger rejected the connection.");
      }
    } catch (e) {
      setError("Failed to communicate with infrastructure.");
    } finally {
      setLoading(false);
    }
  };

  const handleStopCharge = () => {
    if (activeSession) {
      // In a real app, we would call the stop API here
      onSessionEnd();
    }
  };

  if (!charger && !activeSession) return null;

  // If there is an active session, it takes precedence over selected charger
  const displayCharger = activeSession && charger?.id !== activeSession.chargerId ? charger : charger;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-6 z-[1000] shadow-2xl rounded-t-3xl md:w-96 md:left-4 md:bottom-4 md:rounded-xl md:border">
      
      {/* Handle Bar for mobile */}
      <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4 md:hidden" onClick={onClose}></div>

      {activeSession ? (
        // ACTIVE SESSION VIEW
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <span className="animate-pulse">●</span> Charging
            </h2>
            <span className="text-sm text-gray-400 font-mono">ID: {activeSession.id.slice(-6)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-white">{activeSession.kwhDelivered.toFixed(2)}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">kWh Delivered</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-white">${activeSession.currentCost.toFixed(2)}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Current Cost</div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-xl">
             <div className="flex justify-between text-sm mb-2">
               <span className="text-gray-400">Rate</span>
               <span className="text-white">${displayCharger?.pricePerKwh}/kWh</span>
             </div>
             <div className="flex justify-between text-sm mb-2">
               <span className="text-gray-400">Service Fee ({SERVICE_FEE_PERCENT * 100}%)</span>
               <span className="text-white">${(activeSession.currentCost * SERVICE_FEE_PERCENT).toFixed(2)}</span>
             </div>
             <div className="w-full bg-gray-700 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-green-500 h-full w-full animate-progress-indeterminate"></div>
             </div>
          </div>

          <button 
            onClick={handleStopCharge}
            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Square size={20} fill="currentColor" /> Stop Charging
          </button>
        </div>
      ) : (
        // CHARGER DETAILS VIEW
        displayCharger && (
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white">{displayCharger.name}</h2>
              <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                <MapPin size={14} /> {displayCharger.address}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
          </div>

          <div className="flex gap-2 my-2">
            {displayCharger.connectors.map(c => (
              <span key={c} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-200">{c}</span>
            ))}
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              displayCharger.status === ChargerStatus.AVAILABLE ? 'bg-green-900 text-green-300' : 
              displayCharger.status === ChargerStatus.BUSY ? 'bg-orange-900 text-orange-300' : 'bg-red-900 text-red-300'
            }`}>
              {displayCharger.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
             <div className="bg-gray-800 p-3 rounded-lg flex flex-col gap-1">
               <span className="text-gray-400 text-xs">Power</span>
               <span className="font-bold text-lg text-white flex items-center gap-1">
                 <Zap size={16} className="text-yellow-400" /> {displayCharger.powerKW} kW
               </span>
             </div>
             <div className="bg-gray-800 p-3 rounded-lg flex flex-col gap-1">
               <span className="text-gray-400 text-xs">Price</span>
               <span className="font-bold text-lg text-white flex items-center gap-1">
                 <CreditCard size={16} className="text-blue-400" /> ${displayCharger.pricePerKwh}
               </span>
             </div>
          </div>

          {displayCharger.discount && (
            <div className="bg-green-900/30 border border-green-800 p-3 rounded-lg flex items-center gap-2 text-green-300 text-sm">
              <CheckCircle size={16} /> {displayCharger.discount}
            </div>
          )}

          {error && (
             <div className="bg-red-900/30 border border-red-800 p-3 rounded-lg flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            onClick={handleStartCharge}
            disabled={displayCharger.status !== ChargerStatus.AVAILABLE || loading}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              displayCharger.status === ChargerStatus.AVAILABLE && !loading
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="animate-spin text-2xl">⟳</span>
            ) : (
              <>
                <Play size={20} fill="currentColor" /> 
                {displayCharger.status === ChargerStatus.AVAILABLE ? 'Unlock & Charge' : 'Unavailable'}
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-500">
            Powered by VoltLink. Service fee applies.
          </p>
        </div>
        )
      )}
    </div>
  );
};

export default ControlPanel;