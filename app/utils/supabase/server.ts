import {
  createServerClient as sbCreateServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';

export async function createServerClient(request: Request) {
  const headers = new Headers();

  const supabase = sbCreateServerClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      },
      setAll(cookies) {
        const mappedCookies = Object.values(cookies).map(({ name, value, options }) =>
          serializeCookieHeader(name, value, options),
        );
        headers.append('Set-Cookie', mappedCookies.join('; '));
      },
    },
  });

  return { supabase, headers };
}
