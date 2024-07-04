import { z } from 'zod';
import { isBlurhashValid } from 'blurhash';
import { isValidNanoid } from './nanoid';

export const dateStringSchema = z.string().refine((arg) => {
  if (!arg) return false;
  return !Number.isNaN(new Date(arg).getTime());
});

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
}, z.date()) as z.ZodType<Date | undefined>; // fix for preprocess

export const nanoidSchema = z.string().refine(isValidNanoid, { message: 'Invalid nanoid' });

export const blurhashSchema = z
  .string()
  .refine((value) => isBlurhashValid(value).result, { message: 'Invalid blurhash' });

export const authSchema = z.object({
  email: z.string({ required_error: 'Email required' }).email({ message: 'Invalid email' }),
  password: z
    .string({ required_error: 'Password required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export const albumSchema = z.object({
  album_id: nanoidSchema,
  user_id: z.string(),
  name: z.string(),
  is_public: z.boolean(),
  created_at: dateStringSchema,
  edited_at: dateStringSchema,
});

export const albumListSchema = z.array(albumSchema);

export const photoSchema = z.object({
  photo_id: nanoidSchema,
  album_id: nanoidSchema,
  file_path: z.string(),
  name: z.string(),
  blurhash: blurhashSchema,
  created_at: dateStringSchema,
});

export const photoListSchema = z.array(photoSchema);
