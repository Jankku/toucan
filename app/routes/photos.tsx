import { Container, Flex, Heading, useToast } from '@chakra-ui/react';
import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { createServerClient } from '~/utils/supabase/server';
import { useLoaderData } from '@remix-run/react';
import { albumSchema, photoSchema } from '~/utils/zod-schema';
import { getFullPhotoUrl } from '~/utils/photos';
import { z } from 'zod';
import { AlbumPhotoList } from '~/components/AlbumPhotoList';
import { useFetcherWithReset } from '~/hooks/useFetcherWithReset';
import { action as deleteAction } from './photos_.delete';
import { useEffect } from 'react';

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
    url: getFullPhotoUrl(supabase, photo.file_path),
  }));

  return json({ photos }, { headers });
};

export default function Photos() {
  const data = useLoaderData<typeof loader>();
  const deletePhotoFetcher = useFetcherWithReset<typeof deleteAction>();
  const toast = useToast();

  const onDeletePhotos = async (photoids: string[]) => {
    const formData = new FormData();
    photoids.forEach((id) => formData.append('photoIds', id));
    deletePhotoFetcher.submit(formData, {
      action: '/photos/delete',
      method: 'DELETE',
    });
  };

  useEffect(() => {
    const fetcherData = deletePhotoFetcher.data;
    if (fetcherData?.message || fetcherData?.error) {
      toast({
        title: fetcherData.error || fetcherData.message,
        status: fetcherData.error ? 'error' : 'success',
      });
      deletePhotoFetcher.reset();
    }
  }, [deletePhotoFetcher, toast]);

  return (
    <Container py={8} maxW="container.xl">
      <Flex direction="column" gap={8}>
        <Heading as="h1">Photos</Heading>
        <AlbumPhotoList photos={data.photos} onDeletePhotos={onDeletePhotos} />
      </Flex>
    </Container>
  );
}

export const meta: MetaFunction = () => {
  return [{ title: 'Photos | Toucan' }];
};
