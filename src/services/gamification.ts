import { supabase } from './supabase';

export interface AgendaItem {
  id: string;
  place_name: string;
  lat: number;
  lng: number;
  visit_date: string | null;
  status: string;
  created_at: string;
}

export interface StoreCoupon {
  id: string;
  title: string;
  discount_percentage: number;
  cost_points: number;
  imageUrl?: string;
}

export interface UserCoupon {
  id: string;
  coupon_code: string;
  discount_percentage: number;
  claimed_at: string;
}

// Mock store for MVP
export const AVAILABLE_COUPONS: StoreCoupon[] = [
  { 
    id: 'c1', 
    title: 'Pupusas al 2x1', 
    discount_percentage: 50, 
    cost_points: 100,
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=200&fit=crop'
  },
  { 
    id: 'c2', 
    title: '15% Dto en Hotel de Playa', 
    discount_percentage: 15, 
    cost_points: 300,
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=200&fit=crop'
  },
  { 
    id: 'c3', 
    title: 'Entrada Gratis a Museo MARTE', 
    discount_percentage: 100, 
    cost_points: 500,
    imageUrl: 'https://images.unsplash.com/photo-1518998053401-878c735c0865?w=400&h=200&fit=crop'
  },
];

export async function getUserPoints(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('total_points')
    .eq('id', userId)
    .maybeSingle(); // maybeSingle evita el error 406 si no hay fila

  if (error) {
    console.warn("No se pudo obtener puntos (puede que el perfil no exista aún):", error);
    return 0;
  }
  return data?.total_points || 0;
}

export async function getUserAgenda(userId: string): Promise<AgendaItem[]> {
  const { data, error } = await supabase
    .from('user_agenda')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching agenda:", error);
    return [];
  }
  return data || [];
}

export async function saveLocationToAgendaAndEarnPoints(
  userId: string, 
  placeName: string, 
  lat: number, 
  lng: number,
  visitDate?: string | null
): Promise<{ success: boolean; newTotalPoints: number }> {
  
  // 1. Asegurarnos que el perfil existe ANTES de insertar en la agenda (Fix 409)
  const currentPoints = await getUserPoints(userId);
  await supabase.from('profiles').upsert({ id: userId, total_points: currentPoints });

  // 2. Insert into Agenda
  const row: Record<string, unknown> = { user_id: userId, place_name: placeName, lat, lng };
  if (visitDate) row.visit_date = visitDate;
  
  const { error: agendaError } = await supabase
    .from('user_agenda')
    .insert([row]);

  if (agendaError) {
    console.error("Error saving to agenda:", agendaError);
    return { success: false, newTotalPoints: currentPoints };
  }

  // 3. Add +50 points
  const newPoints = currentPoints + 50;
  const { error: pointsError } = await supabase
    .from('profiles')
    .upsert({ id: userId, total_points: newPoints });

  if (pointsError) {
    console.error("Error updating points:", pointsError);
    return { success: false, newTotalPoints: currentPoints };
  }

  return { success: true, newTotalPoints: newPoints };
}

export async function getUserCoupons(userId: string): Promise<UserCoupon[]> {
  const { data, error } = await supabase
    .from('user_coupons')
    .select('*')
    .eq('user_id', userId)
    .order('claimed_at', { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
  return data || [];
}

export async function buyCoupon(userId: string, coupon: StoreCoupon): Promise<{ success: boolean; newTotalPoints: number }> {
  const currentPoints = await getUserPoints(userId);

  if (currentPoints < coupon.cost_points) {
    return { success: false, newTotalPoints: currentPoints };
  }

  const newPoints = currentPoints - coupon.cost_points;

  // 1. Guardar cupón
  const uniqueCode = `SV-${coupon.discount_percentage}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const { error: couponError } = await supabase
    .from('user_coupons')
    .insert([
      { 
        user_id: userId, 
        coupon_code: uniqueCode, 
        discount_percentage: coupon.discount_percentage 
      }
    ]);

  if (couponError) {
    console.error("Error saving coupon:", couponError);
    return { success: false, newTotalPoints: currentPoints };
  }

  // 2. Restar puntos
  const { error: pointsError } = await supabase
    .from('profiles')
    .upsert({ id: userId, total_points: newPoints });

  if (pointsError) {
    console.error("Error updating points after buying:", pointsError);
  }

  return { success: true, newTotalPoints: newPoints };
}

export async function markAgendaVisitedAndEarnPoints(userId: string, agendaId: string): Promise<{ success: boolean; newTotalPoints: number }> {
  // 1. Marcar como completado
  const { error: agendaError } = await supabase
    .from('user_agenda')
    .update({ status: 'visited' })
    .eq('id', agendaId);

  if (agendaError) {
    console.error("Error marking agenda as visited:", agendaError);
    return { success: false, newTotalPoints: 0 };
  }

  // 2. Dar 200 puntos por visitar físicamente
  const currentPoints = await getUserPoints(userId);
  const newPoints = currentPoints + 200;

  const { error: pointsError } = await supabase
    .from('profiles')
    .upsert({ id: userId, total_points: newPoints });

  if (pointsError) {
    console.error("Error updating points after visit:", pointsError);
  }

  return { success: true, newTotalPoints: newPoints };
}
