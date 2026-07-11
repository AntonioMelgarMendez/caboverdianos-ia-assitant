import React, { useEffect, useState } from 'react';
import { X, Store, Ticket, Loader2, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  AVAILABLE_COUPONS, 
  getUserCoupons, 
  buyCoupon
} from '../services/gamification';
import type { UserCoupon, StoreCoupon } from '../services/gamification';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userPoints: number;
  onPointsUpdated: (newPoints: number) => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose, userId, userPoints, onPointsUpdated }) => {
  const [activeTab, setActiveTab] = useState<'store' | 'wallet'>('store');
  const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'wallet') {
      setLoading(true);
      getUserCoupons(userId).then(data => {
        setMyCoupons(data);
        setLoading(false);
      });
    }
  }, [isOpen, activeTab, userId]);

  if (!isOpen) return null;

  const handleBuy = async (coupon: StoreCoupon) => {
    if (userPoints < coupon.cost_points) return;
    
    setProcessingId(coupon.id);
    const res = await buyCoupon(userId, coupon);
    if (res.success) {
      onPointsUpdated(res.newTotalPoints);
      setActiveTab('wallet'); // Cambiar a la billetera automáticamente
    } else {
      alert("No se pudo comprar el cupón. Intenta de nuevo.");
    }
    setProcessingId(null);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-800/50">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-2 text-sm font-bold pb-1 transition-colors ${activeTab === 'store' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Store className="w-4 h-4" /> Tienda
            </button>
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 text-sm font-bold pb-1 transition-colors ${activeTab === 'wallet' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Ticket className="w-4 h-4" /> Mis Cupones
            </button>
          </div>
          
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-zinc-950">
          
          {/* STORE TAB */}
          {activeTab === 'store' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-4 flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-xs text-amber-500/80 font-bold uppercase">Balance Disponible</p>
                  <p className="text-lg font-black text-amber-400">{userPoints} pts</p>
                </div>
              </div>

              {AVAILABLE_COUPONS.map(c => {
                const canAfford = userPoints >= c.cost_points;
                const isProcessing = processingId === c.id;

                return (
                  <div key={c.id} className="bg-zinc-800/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">{c.title}</h3>
                      <p className="text-sm text-zinc-400">Costo: {c.cost_points} pts</p>
                    </div>
                    <button 
                      onClick={() => handleBuy(c)}
                      disabled={!canAfford || isProcessing}
                      className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-transform active:scale-95
                        ${canAfford 
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20' 
                          : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}
                      `}
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Comprar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* WALLET TAB */}
          {activeTab === 'wallet' && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
                  <p>Cargando tu billetera...</p>
                </div>
              ) : myCoupons.length === 0 ? (
                <div className="text-center py-12 px-4 text-zinc-400">
                  <Ticket className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p>Aún no tienes cupones.</p>
                  <p className="text-sm mt-2 text-zinc-500">Ve a la tienda y canjea tus puntos.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {myCoupons.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl p-6 flex flex-col items-center border-4 border-dashed border-zinc-200">
                      <h3 className="font-black text-2xl text-zinc-900 mb-2">{c.discount_percentage}% DTO</h3>
                      <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Muestra este QR al cajero</p>
                      
                      <div className="bg-zinc-100 p-4 rounded-xl">
                        <QRCodeSVG 
                          value={c.coupon_code} 
                          size={150}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      
                      <p className="font-mono text-zinc-400 mt-4 text-sm bg-zinc-100 px-3 py-1 rounded-md">
                        {c.coupon_code}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CouponModal;
