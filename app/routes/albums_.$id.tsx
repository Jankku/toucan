import {
  Box,
  Checkbox,
  CheckboxGroup,
  Container,
  Flex,
  Heading,
  IconButton,
  SimpleGrid,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { ChangeEvent, useEffect, useState } from 'react';
import { FileUpload, Photo } from '~/components/FileUpload';
import { requireUser } from '~/utils/auth.server';
import { createServerClient } from '~/utils/supabase/server';
import { createClient } from '~/utils/supabase/client';
import { albumSchema, nanoidSchema, photoListSchema } from '~/utils/zod-schema';
import { createSignedUrls, getFullPhotoUrl, uploadPhotos, uploadSchema } from '~/utils/photos';
import { AlbumPhoto } from '~/components/AlbumPhoto';
import { DeleteIcon } from '@chakra-ui/icons';
import { action as deleteAction } from './photos_.delete';
import { useFetcherWithReset } from '~/hooks/useFetcherWithReset';
import { useCheckbox } from '~/hooks/useCheckbox';

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

  const photoResponse = await supabase.from('photos').select('*').eq('album_id', albumId);
  const parsedPhotos = photoListSchema.parse(photoResponse.data);
  const photos = parsedPhotos.map((photo) => ({
    ...photo,
    file_path: getFullPhotoUrl(supabase, photo.file_path),
  }));

  return json({ userId: user.id, album, photos }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, headers } = await createServerClient(request);
  const user = await requireUser(supabase);

  const { uploads } = uploadSchema.parse(await request.json());

  const { error } = await supabase.from('photos').insert(uploads);
  if (error) {
    return json({ message: 'Error uploading photos', signedUrls: null }, { status: 500 });
  }

  const signedUrls = await createSignedUrls({ supabase, userId: user.id, uploads });

  return json({ signedUrls, message: null }, { headers });
};

export default function AlbumPhotos() {
  const data = useLoaderData<typeof loader>();
  const toast = useToast();
  const uploadPhotoMetadataFetcher = useFetcher<typeof action>();
  const deletePhotoFetcher = useFetcherWithReset<typeof deleteAction>();
  const [photoIdFileMap] = useState<Map<string, File>>(() => new Map());
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const selectAllCheckbox = useCheckbox({ data: data.photos, checkedValues: selectedImageIds });
  const [supabase] = useState(() => createClient());

  const isUploading = uploadPhotoMetadataFetcher.state === 'submitting';

  const onCompressed = async (compressedPhotos: Photo[]) => {
    compressedPhotos.forEach((photo) => {
      photoIdFileMap.set(photo.photo_id, photo.file);
    });

    const uploads = compressedPhotos.map((photo) => {
      return {
        photo_id: photo.photo_id,
        album_id: data.album.album_id,
        file_path: `${data.userId}/${data.album.album_id}/${photo.photo_id}`,
        name: photo.file.name,
        blurhash: photo.blurhash,
      };
    });

    uploadPhotoMetadataFetcher.submit({ uploads }, { method: 'POST', encType: 'application/json' });
  };

  const onSelectAllImages = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    if (value) {
      const allIds = data.photos.map((photo) => photo.photo_id);
      setSelectedImageIds(allIds);
    } else {
      setSelectedImageIds([]);
    }
  };

  const onSelectImage = (values: string[]) => {
    setSelectedImageIds(values);
  };

  const onDeleteImages = async () => {
    const formData = new FormData();
    selectedImageIds.forEach((id) => formData.append('photoIds', id));
    deletePhotoFetcher.submit(formData, {
      action: '/photos/delete',
      method: 'DELETE',
    });
    setSelectedImageIds([]);
  };

  useEffect(() => {
    if (!uploadPhotoMetadataFetcher.data) return;
    (async () => {
      const signedUrls = uploadPhotoMetadataFetcher.data?.signedUrls;
      if (!signedUrls) return;
      const { failedUplods } = await uploadPhotos({ supabase, photoIdFileMap, signedUrls });
      failedUplods.forEach((error) => {
        toast({
          title: 'Failed to upload photo',
          description: error.message,
          status: 'error',
        });
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadPhotoMetadataFetcher.data]);

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
    <Container py={8} maxW="container.lg">
      <Flex direction="column" gap={8}>
        <Heading as="h1">{data.album.name}</Heading>
        <Box maxW="md">
          <FileUpload isUploading={isUploading} onCompressed={onCompressed} />
        </Box>
        {selectedImageIds.length > 0 ? (
          <Box p={4} bg="orange.50" border="1px solid" borderColor="orange.200" fontWeight={500}>
            <Flex alignItems="center" justify="space-between">
              <Flex gap={4}>
                <Checkbox
                  aria-label="Select all photos"
                  isChecked={selectAllCheckbox.isChecked}
                  isIndeterminate={selectAllCheckbox.isIndeterminate}
                  onChange={onSelectAllImages}
                />
                <Text>{selectedImageIds.length} photos selected</Text>
              </Flex>
              <Tooltip hasArrow label={`Delete ${selectedImageIds.length} images`}>
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label={`Delete ${selectedImageIds.length} images`}
                  onClick={onDeleteImages}
                />
              </Tooltip>
            </Flex>
          </Box>
        ) : undefined}
        <CheckboxGroup value={selectedImageIds} onChange={onSelectImage}>
          <SimpleGrid columns={[1, 2, 3]} gap={4}>
            {data.photos.map(({ photo_id, file_path, name, blurhash }) => (
              <AlbumPhoto
                key={photo_id}
                id={photo_id}
                src={file_path}
                alt={name}
                blurhash={blurhash}
              />
            ))}
          </SimpleGrid>
        </CheckboxGroup>
      </Flex>
    </Container>
  );
}
