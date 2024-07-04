import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { photoSchema } from './zod-schema';

const placeholderUrl = 'https://placehold.co/1x1/fafafa/fafafa/jpg';

export const getFullPhotoUrl = (supabase: SupabaseClient, path?: string) => {
  return path ? supabase.storage.from('photos').getPublicUrl(path).data.publicUrl : placeholderUrl;
};

export const uploadSchema = z.object({
  uploads: z.array(photoSchema.omit({ created_at: true })),
});

type Uploads = z.infer<typeof uploadSchema>['uploads'];

type SignedUrl = {
  signedUrl: string;
  token: string;
  path: string;
};

type CreateSignedUrlProps = {
  supabase: SupabaseClient;
  userId: string;
  uploads: Uploads;
};

export const createSignedUrls = async ({
  supabase,
  userId,
  uploads,
}: CreateSignedUrlProps): Promise<SignedUrl[]> => {
  const uploadPromises = uploads.map((upload) => {
    return supabase.storage
      .from('photos')
      .createSignedUploadUrl(`${userId}/${upload.album_id}/${upload.photo_id}`, {
        upsert: true,
      });
  });
  const signedUrlResults = await Promise.all(uploadPromises);
  return signedUrlResults.map((result) => result.data) as SignedUrl[];
};

type UploadPhotosProps = {
  supabase: SupabaseClient;
  photoIdFileMap: Map<string, File>;
  signedUrls: SignedUrl[];
};

export const uploadPhotos = async ({ supabase, photoIdFileMap, signedUrls }: UploadPhotosProps) => {
  const uploadPromises = [];
  for (const [photo_id, file] of photoIdFileMap.entries()) {
    const signedUrl = signedUrls.find(({ path }) => path.includes(photo_id));
    if (!signedUrl) continue;
    uploadPromises.push(
      supabase.storage.from('photos').uploadToSignedUrl(signedUrl.path, signedUrl.token, file),
    );
  }
  const uploadResults = await Promise.allSettled(uploadPromises);
  const successfulUploads = uploadResults
    .filter((p) => p.status === 'fulfilled')
    .map((p) => p.value);
  const failedUplods = uploadResults.filter((p) => p.status === 'rejected').map((p) => p.reason);

  return { successfulUploads, failedUplods };
};
