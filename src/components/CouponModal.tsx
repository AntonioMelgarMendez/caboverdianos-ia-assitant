import React, { useEffect, useState } from 'react';
import { X, Store, Ticket, Loader2, Star, ChevronLeft, ChevronRight, Download } from 'lucide-react';
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
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null);

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
      setActiveTab('wallet');
      setSelectedCoupon(null);
    } else {
      alert("No se pudo comprar el cupón. Intenta de nuevo.");
    }
    setProcessingId(null);
  };

  const getStoreCouponDetails = (percentage: number) => {
    return AVAILABLE_COUPONS.find(c => c.discount_percentage === percentage) || AVAILABLE_COUPONS[0];
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-800/50">
          <div className="flex gap-4">
            <button 
              onClick={() => { setActiveTab('store'); setSelectedCoupon(null); }}
              className={`flex items-center gap-2 text-sm font-bold pb-1 transition-colors ${activeTab === 'store' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Store className="w-4 h-4" /> Tienda
            </button>
            <button 
              onClick={() => { setActiveTab('wallet'); setSelectedCoupon(null); }}
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
                  <div key={c.id} className="bg-zinc-800/50 border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                    {c.imageUrl && (
                      <div className="h-28 w-full relative">
                        <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                        <div className="absolute bottom-2 left-3">
                          <span className="bg-amber-500 text-zinc-950 text-xs font-black px-2 py-1 rounded-md uppercase tracking-wider">
                            {c.discount_percentage}% DTO
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-base leading-tight">{c.title}</h3>
                        <p className="text-sm text-amber-400/80 font-bold mt-1">{c.cost_points} pts</p>
                      </div>
                      <button 
                        onClick={() => handleBuy(c)}
                        disabled={!canAfford || isProcessing}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 shrink-0
                          ${canAfford 
                            ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20' 
                            : 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed'}
                        `}
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Canjear'}
                      </button>
                    </div>
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
              ) : selectedCoupon ? (
                /* VISTA DETALLE DEL CUPÓN */
                <div className="flex flex-col items-center">
                  <div className="w-full flex justify-start mb-4">
                    <button 
                      onClick={() => setSelectedCoupon(null)}
                      className="flex items-center gap-1 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-3 py-1.5 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" /> Volver
                    </button>
                  </div>
                  
                  <div className="w-full bg-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-3 bg-amber-400"></div>
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-zinc-950 rounded-full"></div>
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-zinc-950 rounded-full"></div>
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 border-t-2 border-dashed border-zinc-200"></div>
                    
                    <div className="text-center mb-8 pt-2">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Cupón Exclusivo</p>
                      <h3 className="font-black text-3xl text-zinc-900">{getStoreCouponDetails(selectedCoupon.discount_percentage).title}</h3>
                      <p className="text-amber-600 font-bold mt-1">Descuento del {selectedCoupon.discount_percentage}%</p>
                    </div>
                    
                    <div className="flex flex-col items-center mt-8">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Muestra este QR al cajero</p>
                      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                        <QRCodeSVG 
                          value={selectedCoupon.coupon_code} 
                          size={180}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <p className="font-mono text-zinc-500 font-bold mt-4 text-base tracking-widest bg-zinc-100 px-4 py-2 rounded-lg">
                        {selectedCoupon.coupon_code}
                      </p>
                    </div>
                  </div>
                  
                  <button className="mt-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold">
                    <Download className="w-4 h-4" /> Guardar como imagen
                  </button>
                </div>
              ) : (
                /* VISTA LISTA DE CUPONES */
                <div className="space-y-3">
                  <p className="text-sm text-zinc-400 mb-4 font-bold">Tienes {myCoupons.length} cupones disponibles:</p>
                  <div className="grid grid-cols-1 gap-3">
                    {myCoupons.map(c => {
                      const details = getStoreCouponDetails(c.discount_percentage);
                      return (
                        <button 
                          key={c.id} 
                          onClick={() => setSelectedCoupon(c)}
                          className="w-full bg-zinc-800/50 border border-white/5 hover:border-amber-500/50 rounded-xl p-3 flex items-center justify-between text-left transition-all hover:bg-zinc-800"
                        >
                          <div className="flex items-center gap-4">
                            {details.imageUrl ? (
                              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-md">
                                <img src={details.imageUrl} alt={details.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                                <Ticket className="w-6 h-6 text-amber-500" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight">{details.title}</h3>
                              <span className="inline-block mt-1 text-[10px] bg-amber-500 text-zinc-950 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                {c.discount_percentage}% DTO
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
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
