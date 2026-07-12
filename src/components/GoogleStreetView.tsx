/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MapPinOff } from 'lucide-react';

interface GoogleStreetViewProps {
  lat: number;
  lng: number;
}

// Para evitar cargar el script múltiples veces en la aplicación
let isGoogleMapsScriptLoaded = false;
let googleMapsScriptPromise: Promise<void> | null = null;

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  if (isGoogleMapsScriptLoaded) return Promise.resolve();
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGoogleMapsScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
};

export const checkStreetViewAvailability = async (lat: number, lng: number): Promise<boolean> => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return false;
    await loadGoogleMapsScript(apiKey);
    
    return new Promise((resolve) => {
      const svService = new google.maps.StreetViewService();
      const location = new google.maps.LatLng(lat, lng);
      svService.getPanorama({ location, radius: 200 }, (data: any, status: any) => {
        if (status === google.maps.StreetViewStatus.OK && data && data.location && data.location.latLng) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  } catch (e) {
    return false;
  }
};

const GoogleStreetView: React.FC<GoogleStreetViewProps> = ({ lat, lng }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const initStreetView = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('No Google Maps API Key provided');
        }

        await loadGoogleMapsScript(apiKey);
        
        if (!containerRef.current) return;

        // Verificar si hay cobertura de Street View en esa zona
        const svService = new google.maps.StreetViewService();
        const location = new google.maps.LatLng(lat, lng);
        
        svService.getPanorama({ location, radius: 200 }, (data: any, status: any) => {
          if (status === google.maps.StreetViewStatus.OK && data && data.location && data.location.latLng) {
            setIsLoading(false);
            
            // Inicializar el visor de Street View
            new google.maps.StreetViewPanorama(containerRef.current!, {
              position: data.location.latLng,
              pov: { heading: 0, pitch: 0 },
              zoom: 1,
              addressControl: false,
              showRoadLabels: false,
              zoomControl: true,
              panControl: true,
              enableCloseButton: false,
            });
          } else {
            // No hay cobertura en un radio de 200m
            setIsLoading(false);
            setNoData(true);
          }
        });
      } catch (error) {
        console.error("Error cargando Google Street View:", error);
        setIsLoading(false);
        setHasError(true);
      }
    };

    initStreetView();

    return () => {
      // Cleanup if needed
    };
  }, [lat, lng]);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 gap-2 rounded-xl border border-white/5">
        <MapPinOff className="w-8 h-8" />
        <span className="text-sm">Error cargando Street View</span>
      </div>
    );
  }

  if (noData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 gap-2 rounded-xl border border-white/5">
        <MapPinOff className="w-8 h-8" />
        <span className="text-sm">No hay vista 360° disponible en esta ubicación</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-zinc-950 rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900 animate-pulse">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
          <div className="h-4 w-48 bg-zinc-800 rounded-full mb-2"></div>
          <div className="h-3 w-32 bg-zinc-800 rounded-full"></div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleStreetView;
