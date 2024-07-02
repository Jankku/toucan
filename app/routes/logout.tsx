import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { createServerClient } from '~/utils/supabase/server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = await createServerClient(request);

  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect('/');
  }

  await supabase.auth.signOut();
  return redirect('/', {
    headers,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, headers } = await createServerClient(request);

  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect('/');
  }

  await supabase.auth.signOut();
  return redirect('/', {
    headers,
  });
};
