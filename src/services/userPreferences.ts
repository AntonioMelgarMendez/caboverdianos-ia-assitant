import { supabase } from './supabase';

export interface UserPreferences {
  preferred_categories: string[];
  budget_range: string;
  trip_duration: string;
  onboarding_completed: boolean;
}

export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.onboarding_completed === true;
};

export const saveUserPreferences = async (userId: string, prefs: Partial<UserPreferences>): Promise<void> => {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      id: userId,
      ...prefs,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error saving user preferences:', error);
  }
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserPreferences;
};
