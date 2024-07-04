import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod';
import { requireUser } from '~/utils/auth.server';
import { createServerClient } from '~/utils/supabase/server';

const deletePhotosSchema = z.object({
  photoIds: z.array(z.string()),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = await createServerClient(request);
  const user = await requireUser(supabase);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: deletePhotosSchema });

  if (submission.status !== 'success') {
    return json({ error: 'Failed to delete photos', message: null }, { status: 400 });
  }

  const ids = submission.value.photoIds;

  const albumResponse = await supabase
    .from('albums')
    .select('photos(photo_id, file_path)')
    .eq('user_id', user.id);

  if (albumResponse.error) {
    return json({ error: 'Failed to delete photos', message: null });
  }

  const photos = albumResponse.data.map(({ photos }) => photos).flat();

  const photoIdsToDelete = photos.map(({ photo_id }) => photo_id).filter((id) => ids.includes(id));

  const filePathsToDelete = photos
    .map(({ file_path }) => file_path)
    .filter((path) => photoIdsToDelete.some((id) => path.includes(id)));

  await supabase.from('photos').delete().in('photo_id', photoIdsToDelete);
  await supabase.storage.from('photos').remove(filePathsToDelete);

  return json({ message: 'Photos deleted', error: null });
};
