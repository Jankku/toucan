import { SupabaseClient } from '@supabase/supabase-js';

export const getFullPictureUrl = (supabase: SupabaseClient, path: string) => {
  return supabase.storage.from('pictures').getPublicUrl(path).data.publicUrl;
};
