import { supabase } from './supabase';

export interface AgendaItem {
  id: string;
  place_name: string;
  lat: number;
  lng: number;
  status: string;
  created_at: string;
}

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
