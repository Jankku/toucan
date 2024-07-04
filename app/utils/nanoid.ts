import { customAlphabet } from 'nanoid';

export const NANOID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const NANOID_LENGTH = 10;

const nanoid = customAlphabet(NANOID_ALPHABET, NANOID_LENGTH);

const nanoIdAlphabetSet = new Set(NANOID_ALPHABET);
export const isValidNanoid = (value: string): boolean => {
  return (
    value.length === NANOID_LENGTH && Array.from(value).every((char) => nanoIdAlphabetSet.has(char))
  );
};

export const createId = () => nanoid();
