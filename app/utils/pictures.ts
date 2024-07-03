import { SupabaseClient } from '@supabase/supabase-js';

const placeholderUrl = 'https://placehold.co/1x1/fafafa/fafafa/jpg';

export const getFullPictureUrl = (supabase: SupabaseClient, path?: string) => {
  return path
    ? supabase.storage.from('pictures').getPublicUrl(path).data.publicUrl
    : placeholderUrl;
};
