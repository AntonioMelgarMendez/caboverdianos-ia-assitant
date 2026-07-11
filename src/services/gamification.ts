import { supabase } from './supabase';

export interface AgendaItem {
  id: string;
  place_name: string;
  lat: number;
  lng: number;
  status: string;
  created_at: string;
}

export interface StoreCoupon {
  id: string;
  title: string;
  discount_percentage: number;
  cost_points: number;
}

export interface UserCoupon {
  id: string;
  coupon_code: string;
  discount_percentage: number;
  claimed_at: string;
}

// Mock store for MVP
export const AVAILABLE_COUPONS: StoreCoupon[] = [
  { id: 'c-1', title: 'Pupusas al 2x1', discount_percentage: 50, cost_points: 100 },
  { id: 'c-2', title: '15% Dto en Hotel', discount_percentage: 15, cost_points: 300 },
  { id: 'c-3', title: 'Entrada Gratis a Museo', discount_percentage: 100, cost_points: 500 },
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
  lng: number
): Promise<{ success: boolean; newTotalPoints: number }> {
  
  // 1. Insert into Agenda
  const { error: agendaError } = await supabase
    .from('user_agenda')
    .insert([
      { user_id: userId, place_name: placeName, lat, lng }
    ]);

  if (agendaError) {
    console.error("Error saving to agenda:", agendaError);
    return { success: false, newTotalPoints: 0 };
  }

  // 2. Add +50 points (Upsert para crear el perfil si el usuario es viejo y no lo tenía)
  const currentPoints = await getUserPoints(userId);
  const newPoints = currentPoints + 50;

  const { error: pointsError } = await supabase
    .from('profiles')
    .upsert({ id: userId, total_points: newPoints });

  if (pointsError) {
    console.error("Error updating points:", pointsError);
    // Even if points fail, agenda was saved, but we return false to notify user
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
