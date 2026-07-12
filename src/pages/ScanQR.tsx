import React, { useState, useEffect, useRef } from 'react';
import { QrCode, ScanLine, CheckCircle2, Store, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';

type ScanState = 'tutorial' | 'scanning' | 'success';

const ScanQR: React.FC = () => {
  const [scanState, setScanState] = useState<ScanState>('tutorial');
  const navigate = useNavigate();

  // Animación simple para el escáner
  const [scanLinePos, setScanLinePos] = useState(0);
  const [scannedCode, setScannedCode] = useState<string>('SV-15-HR6JPA'); // Default fallback
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanAnimationFrame = useRef<number | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanAnimationFrame.current) {
      cancelAnimationFrame(scanAnimationFrame.current);
      scanAnimationFrame.current = null;
    }
  };

  const scanVideoFrame = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          // Si encontramos un código válido, detener escaneo y marcar éxito
          setScannedCode(code.data);
          setScanState('success');
          stopCamera();
          return; // Stop loop
        }
      }
    }
    scanAnimationFrame.current = requestAnimationFrame(scanVideoFrame);
  };

  useEffect(() => {
    if (scanState === 'scanning') {
      const interval = setInterval(() => {
        setScanLinePos((prev) => (prev > 95 ? 0 : prev + 2));
      }, 30);
      
      // Request camera access
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Start scanning frames once the video starts playing
            videoRef.current.addEventListener('play', () => {
              scanAnimationFrame.current = requestAnimationFrame(scanVideoFrame);
            });
          }
        })
        .catch(err => console.error("Camera access denied or unavailable", err));

      return () => {
        clearInterval(interval);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [scanState]);

  // Limpiar cámara al desmontar componente
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleSimulateScan = () => {
    // En la vida real, aquí se llamaría a la cámara y luego a la API para validar
    setTimeout(() => {
      setScanState('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Header Falso para Comercio */}
      <div className="absolute top-0 left-0 w-full p-4 border-b border-white/5 bg-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-400">
          <Store className="w-5 h-5" />
          <span className="font-bold">Cipitour Comercios</span>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-sm mt-16 flex flex-col items-center">
        
        {scanState === 'tutorial' && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
              <QrCode className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-2xl font-black text-white text-center mb-2">Portal de Descuentos</h1>
            <p className="text-zinc-400 text-center mb-8 px-4 text-sm">
              Escanea el cupón de tu cliente para aplicar el descuento y registrar la venta.
            </p>

            <div className="w-full space-y-4 mb-8">
              <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold shrink-0">1</div>
                <p className="text-sm text-zinc-300">Pide al turista que abra su cupón de Cipitour</p>
              </div>
              <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold shrink-0">2</div>
                <p className="text-sm text-zinc-300">Presiona "Escanear Cupón" y apunta tu cámara</p>
              </div>
              <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold shrink-0">3</div>
                <p className="text-sm text-zinc-300">¡Listo! El descuento se aplica automáticamente</p>
              </div>
            </div>

            <button 
              onClick={() => setScanState('scanning')}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              <ScanLine className="w-5 h-5" />
              Escanear Cupón
            </button>
          </div>
        )}

        {scanState === 'scanning' && (
          <div className="flex flex-col items-center w-full animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-white mb-6">Apuntando al QR...</h2>
            
            {/* Contenedor del escáner */}
            <div className="relative w-64 h-64 bg-zinc-900 border-2 border-dashed border-purple-500/50 rounded-2xl overflow-hidden mb-8 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              {/* Esquinas (simulación de visor) */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-xl m-2" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-xl m-2" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-xl m-2" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-xl m-2" />
              
              {/* Línea láser animada */}
              <div 
                className="absolute left-0 w-full h-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] z-20"
                style={{ top: `${scanLinePos}%` }}
              />
              
              {/* Feed de la cámara en vivo */}
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Opacidad extraña simulando cámara oscura */}
              <div className="absolute inset-0 bg-black/40 z-10" />
            </div>
            
            <p className="text-zinc-500 text-sm mb-12 text-center animate-pulse">
              Buscando código QR en la imagen...
            </p>

            {/* Botón mágico para el Pitch (Hackathon) */}
            <button 
              onClick={handleSimulateScan}
              className="bg-zinc-800 text-zinc-300 hover:text-white px-6 py-3 rounded-full text-sm font-medium border border-white/5 hover:bg-zinc-700 transition-colors"
            >
              Simular Lectura Exitosa
            </button>
            <button 
              onClick={() => setScanState('tutorial')}
              className="mt-4 text-zinc-500 text-sm hover:text-zinc-400"
            >
              Cancelar
            </button>
          </div>
        )}

        {scanState === 'success' && (
          <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">¡Cupón Válido!</h2>
            <p className="text-zinc-400 mb-8">El descuento ha sido verificado en el sistema.</p>
            
            <div className="bg-zinc-900 border border-white/5 w-full p-6 rounded-2xl mb-8 shadow-xl">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold">Código Escaneado</p>
              <p className="font-mono text-xl text-green-400 font-bold mb-4 break-all">{scannedCode}</p>
              
              <div className="h-px w-full bg-white/10 mb-4" />
              
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-zinc-400">Descuento a aplicar</span>
                <span className="font-bold text-white">15% OFF</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Estado</span>
                <span className="font-bold text-green-400">Verificado y Consumido</span>
              </div>
            </div>

            <button 
              onClick={() => setScanState('tutorial')}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-colors border border-white/5"
            >
              Escanear Siguiente
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScanQR;
