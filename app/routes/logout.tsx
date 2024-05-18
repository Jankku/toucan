import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { createClient } from '~/utils/supabase/server';

export const loader = async () => redirect('/');

export const action = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = await createClient(request);

  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect('/');
  }

  await supabase.auth.signOut();
  return redirect('/', {
    headers,
  });
};
