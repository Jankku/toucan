import {
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Tag,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { createServerClient } from '~/utils/supabase/server';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { createId } from '~/utils/nanoid';
import { useEffect } from 'react';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { TextInput } from '~/components/TextInput';
import { albumSchema } from '~/utils/zod-schema';
import { getFullPhotoUrl } from '~/utils/photos';
import { ImageWithPlaceholder } from '~/components/ImageWithPlaceholder';

const createAlbumSchema = z.object({
  name: z.string({ required_error: 'Album name is required' }),
});

const albumSchemaWithUrl = albumSchema.extend({
  photos: z.array(
    z.object({
      file_path: z.string(),
      blurhash: z.string(),
    }),
  ),
});

const albumListWithUrlSchema = z.array(albumSchemaWithUrl);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = await createServerClient(request);
  const user = await requireUser(supabase);

  const albumResponse = await supabase
    .from('albums')
    .select('*, photos(*)')
    .order('created_at', { referencedTable: 'photos', ascending: true })
    .eq('user_id', user.id);

  const albumsList = albumListWithUrlSchema.parse(albumResponse.data);

  const albums = albumsList.map((album) => ({
    ...album,
    photo_path: getFullPhotoUrl(supabase, album.photos[0]?.file_path),
    photo_blurhash: album.photos[0]?.blurhash,
    photo_count: album.photos.length,
    photos: undefined,
  }));

  return json({ albums }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = await createServerClient(request);
  const user = await requireUser(supabase);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: createAlbumSchema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { error } = await supabase.from('albums').insert({
    album_id: createId(),
    user_id: user.id,
    name: submission.value.name,
  });

  if (error) {
    return submission.reply({
      formErrors: ['Failed to create album.'],
    });
  }

  return submission.reply({ resetForm: true });
};

export default function Albums() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const toast = useToast();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(createAlbumSchema),
  });

  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (lastResult?.status === 'success') {
      toast({
        title: 'Album created',
        status: 'success',
      });
    }
  }, [lastResult, toast]);

  return (
    <Container py={8} maxW="container.lg">
      <Flex direction="column" gap={8}>
        <Heading as="h1">Albums</Heading>
        <FormProvider context={form.context}>
          <Form method="post" {...getFormProps(form)}>
            <Flex alignItems="end" maxW="sm" gap={1}>
              <TextInput name={fields.name.name} label="Album name" />
              <Button type="submit" isLoading={isSubmitting}>
                Create
              </Button>
            </Flex>
          </Form>
        </FormProvider>
        {data.albums?.length >= 0 ? (
          <SimpleGrid columns={[1, 2, 3, 4]} gap={4}>
            {data.albums.map((album) => (
              <Card key={album.album_id} variant="outline">
                <Link to={`/albums/${album.album_id}`}>
                  <ImageWithPlaceholder
                    src={album.photo_path}
                    blurhash={album.photo_blurhash}
                    alt={album.name}
                  />
                  <CardBody noOfLines={1} overflow="hidden" p={4}>
                    <Flex justifyContent="space-between">
                      <Text fontWeight={500} noOfLines={1}>
                        {album.name}
                      </Text>
                      <Tag size="sm" alignSelf="start">
                        {album.photo_count} items
                      </Tag>
                    </Flex>
                  </CardBody>
                </Link>
              </Card>
            ))}
          </SimpleGrid>
        ) : undefined}
      </Flex>
    </Container>
  );
}

export const meta: MetaFunction = () => {
  return [{ title: 'Albums | Toucan' }];
};
