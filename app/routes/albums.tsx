import { Container, Heading } from '@radix-ui/themes';
import { LoaderFunctionArgs } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { createClient } from '~/utils/supabase/server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = await createClient(request);
  await requireUser(supabase);

  return new Response(null, {
    headers,
  });
};

export default function Albums() {
  return (
    <Container size="2">
      <Heading>Albums</Heading>
    </Container>
  );
}
