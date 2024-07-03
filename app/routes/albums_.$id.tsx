import { Box, Card, Container, Flex, Heading, Image, SimpleGrid } from '@chakra-ui/react';
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { FileUpload, Picture } from '~/components/FileUpload';
import { requireUser } from '~/utils/auth.server';
import { createServerClient } from '~/utils/supabase/server';
import { createClient } from '~/utils/supabase/client';
import { Blurhash } from 'react-blurhash';
import { albumSchema, nanoidSchema, pictureListSchema } from '~/utils/zod-schema';
import { getFullPictureUrl } from '~/utils/pictures';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase, headers } = await createServerClient(request);
  const user = await requireUser(supabase);

  const albumId = nanoidSchema.parse(params.id);

  const albumResponse = await supabase
    .from('albums')
    .select()
    .eq('user_id', user.id)
    .eq('album_id', albumId)
    .limit(1)
    .single();
  const album = albumSchema.parse(albumResponse.data);

  const pictureResponse = await supabase.from('pictures').select('*').eq('album_id', albumId);
  const parsedPictures = pictureListSchema.parse(pictureResponse.data);
  const pictures = parsedPictures.map((picture) => ({
    ...picture,
    file_path: getFullPictureUrl(supabase, picture.file_path),
  }));

  return json({ userId: user.id, album, pictures }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, headers } = await createServerClient(request);
  const user = await requireUser(supabase);

  const formData = await request.formData();
  const uploads = JSON.parse(formData.get('pictures') as string);

  const { error } = await supabase.from('pictures').insert(uploads);

  if (error) {
    return json({ message: 'Error uploading pictures', signedUrls: null }, { status: 500 });
  }

  const signedUrlResults = (await Promise.all(
    uploads.map((upload: Record<string, string>) => {
      return supabase.storage
        .from('pictures')
        .createSignedUploadUrl(`${user.id}/${upload.album_id}/${upload.picture_id}`);
    }),
  )) as { data: { signedUrl: string; path: string; token: string } }[];

  const signedUrls = signedUrlResults.map((result) => result.data);

  return json({ signedUrls, message: null }, { headers });
};

export default function Pictures() {
  const data = useLoaderData<typeof loader>();
  const [pictureIdFileMap] = useState<Map<string, File>>(() => new Map());
  const [supabase] = useState(() => createClient());
  const uploadPictureMetadataFetcher = useFetcher<typeof action>();

  const onCompressed = async (compressedPictures: Picture[]) => {
    compressedPictures.forEach((picture) => {
      pictureIdFileMap.set(picture.picture_id, picture.file);
    });

    const uploads = compressedPictures.map((picture) => {
      return {
        picture_id: picture.picture_id,
        album_id: data.album.album_id,
        file_path: `${data.userId}/${data.album.album_id}/${picture.picture_id}`,
        name: picture.file.name,
        blurhash: picture.blurhash,
      };
    });

    const formData = new FormData();
    formData.append('pictures', JSON.stringify(uploads));

    uploadPictureMetadataFetcher.submit(formData, { method: 'POST' });
  };

  useEffect(() => {
    if (!uploadPictureMetadataFetcher.data) return;
    (async () => {
      const signedUrls = uploadPictureMetadataFetcher.data?.signedUrls;
      if (!signedUrls) return;

      const uploadPromises = [];
      for (const [picture_id, file] of pictureIdFileMap.entries()) {
        const signedUrl = signedUrls.find(({ path }) => path.includes(picture_id));
        if (!signedUrl) continue;
        uploadPromises.push(
          supabase.storage
            .from('pictures')
            .uploadToSignedUrl(signedUrl.path, signedUrl.token, file),
        );
      }
      await Promise.all(uploadPromises);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadPictureMetadataFetcher.data]);

  return (
    <Container maxW="container.lg">
      <Flex direction="column" gap={8}>
        <Heading as="h1">Pictures</Heading>
        <Box maxW="md">
          <FileUpload onCompressed={onCompressed} />
        </Box>
        {uploadPictureMetadataFetcher.state === 'submitting' && <div>Uploading...</div>}
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

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const albumName = data?.album.name || 'Album';
  return [{ title: `${albumName} | Toucan` }];
};
