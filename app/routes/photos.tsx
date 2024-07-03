import { Card, Container, Flex, Heading, Image, SimpleGrid } from '@chakra-ui/react';
import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { createServerClient } from '~/utils/supabase/server';
import { useLoaderData } from '@remix-run/react';
import { albumSchema, pictureSchema } from '~/utils/zod-schema';
import { getFullPictureUrl } from '~/utils/pictures';
import { Blurhash } from 'react-blurhash';
import { z } from 'zod';

const allPicturesSchema = z.array(
  pictureSchema.extend({
    albums: albumSchema,
  }),
);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = await createServerClient(request);
  const user = await requireUser(supabase);

  const pictureResponse = await supabase
    .from('pictures')
    .select(
      `
    picture_id,
    album_id,
    file_path,
    name,
    blurhash,
    created_at,
    albums(*)
  `,
    )
    .eq('albums.user_id', user.id);
  const parsedPictures = allPicturesSchema.parse(pictureResponse.data);
  const pictures = parsedPictures.map((picture) => ({
    ...picture,
    file_path: getFullPictureUrl(supabase, picture.file_path),
  }));

  return json({ pictures }, { headers });
};

export default function Photos() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container maxW="container.lg">
      <Flex direction="column" gap={8}>
        <Heading as="h1">Photos</Heading>
        <SimpleGrid columns={[1, 2, 3]} gap={4}>
          {data.pictures.map((picture) => (
            <Card key={picture.picture_id} variant="surface">
              <Image
                src={picture.file_path}
                alt={picture.name}
                aspectRatio={4 / 3}
                objectFit="cover"
                fallback={<Blurhash hash={picture.blurhash} width="100%" height="100%" />}
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
