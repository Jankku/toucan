import { Card, Container, Flex, Heading, Image, SimpleGrid } from '@chakra-ui/react';
import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { createServerClient } from '~/utils/supabase/server';
import { useLoaderData } from '@remix-run/react';
import { albumSchema, photoSchema } from '~/utils/zod-schema';
import { getFullPhotoUrl } from '~/utils/photos';
import { Blurhash } from 'react-blurhash';
import { z } from 'zod';

const allPhotosSchema = z.array(
  photoSchema.extend({
    albums: albumSchema,
  }),
);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = await createServerClient(request);
  const user = await requireUser(supabase);

  const photoResponse = await supabase
    .from('photos')
    .select(
      `
    photo_id,
    album_id,
    file_path,
    name,
    blurhash,
    created_at,
    albums(*)
  `,
    )
    .eq('albums.user_id', user.id);
  const parsedPhotos = allPhotosSchema.parse(photoResponse.data);
  const photos = parsedPhotos.map((photo) => ({
    ...photo,
    file_path: getFullPhotoUrl(supabase, photo.file_path),
  }));

  return json({ photos }, { headers });
};

export default function Photos() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container py={8} maxW="container.lg">
      <Flex direction="column" gap={8}>
        <Heading as="h1">Photos</Heading>
        <SimpleGrid columns={[1, 2, 3]} gap={4}>
          {data.photos.map((photo) => (
            <Card key={photo.photo_id} variant="surface">
              <Image
                src={photo.file_path}
                alt={photo.name}
                aspectRatio={4 / 3}
                objectFit="cover"
                fallback={<Blurhash hash={photo.blurhash} width="100%" height="100%" />}
              />
            </Card>
          ))}
        </SimpleGrid>
      </Flex>
    </Container>
  );
}

export const meta: MetaFunction = () => {
  return [{ title: 'Photos | Toucan' }];
};
