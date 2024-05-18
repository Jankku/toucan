import { redirect } from '@remix-run/node';
import { SupabaseClient } from '@supabase/supabase-js';

export const requireUser = async (supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      throw redirect('/login');
    }
    return data.user;
  } catch (error) {
    throw redirect('/login');
  }
};
