import {
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { createServerClient } from '~/utils/supabase/server';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { createId } from '~/utils/nanoid';
import { useEffect } from 'react';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { TextInput } from '~/components/TextInput';
import { albumSchema } from '~/utils/zod-schema';
import { getFullPictureUrl } from '~/utils/pictures';
import { ImageWithPlaceholder } from '~/components/ImageWithPlaceholder';

const createAlbumSchema = z.object({
  name: z.string({ required_error: 'Album name is required' }),
});

const albumSchemaWithUrl = albumSchema.extend({
  pictures: z.array(
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
    .select('*, pictures(*)')
    .order('created_at', { referencedTable: 'pictures', ascending: true })
    .eq('user_id', user.id);

  const albumsList = albumListWithUrlSchema.parse(albumResponse.data);

  const albums = albumsList.map((album) => ({
    ...album,
    image_path: album.pictures[0]?.file_path
      ? getFullPictureUrl(supabase, album.pictures[0]?.file_path)
      : 'https://placehold.co/1x1/fefaf0/fefaf0/jpg',
    image_blurhash: album.pictures[0]?.blurhash,
    image_count: album.pictures.length,
    pictures: undefined,
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
  const toast = useToast();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(createAlbumSchema),
    shouldValidate: 'onBlur',
  });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      toast({
        title: 'Album created',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [lastResult, toast]);

  return (
    <Container maxW="container.lg">
      <Flex direction="column" gap={8}>
        <Heading as="h1">Albums</Heading>
        <FormProvider context={form.context}>
          <Form method="post" {...getFormProps(form)}>
            <Flex alignItems="end" maxW="sm" gap={1}>
              <TextInput name={fields.name.name} label="Album name" />
              <Button type="submit">Create</Button>
            </Flex>
          </Form>
        </FormProvider>
        {data.albums?.length >= 0 ? (
          <SimpleGrid columns={[1, 2, 3, 4]} gap={4}>
            {data.albums.map((album) => (
              <Card key={album.album_id} variant="outline">
                <Link to={`/albums/${album.album_id}`}>
                  <ImageWithPlaceholder
                    src={album.image_path}
                    blurhash={album.image_blurhash}
                    alt={album.name}
                  />
                  <CardBody p={2}>
                    <Stack>
                      <Heading as="h2" size="sm" noOfLines={1}>
                        {album.name}
                      </Heading>
                      <Text fontSize="xs">{album.image_count} items</Text>
                    </Stack>
                  </CardBody>
                </Link>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Text>No albums</Text>
        )}
      </Flex>
    </Container>
  );
}

export const meta: MetaFunction = () => {
  return [{ title: 'Albums | Toucan' }];
};
