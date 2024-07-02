import { z } from 'zod';
import { nanoidAlphabet, nanoidLength } from './nanoid';
import { isBlurhashValid } from 'blurhash';

export const dateStringSchema = z.string().refine((arg) => {
  if (!arg) return false;
  return !Number.isNaN(new Date(arg).getTime());
});

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
}, z.date()) as z.ZodType<Date | undefined>; // fix for preprocess

const nanoIdAlphabetSet = new Set(nanoidAlphabet);

const isNanoId = (value: string) => {
  return (
    value.length === nanoidLength && value.split('').every((char) => nanoIdAlphabetSet.has(char))
  );
};

export const nanoidSchema = z.string().refine(isNanoId, { message: 'Invalid nanoid' });

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

export const pictureSchema = z.object({
  picture_id: nanoidSchema,
  album_id: nanoidSchema,
  file_path: z.string(),
  name: z.string(),
  blurhash: blurhashSchema,
  created_at: dateStringSchema,
});

export const pictureListSchema = z.array(pictureSchema);
