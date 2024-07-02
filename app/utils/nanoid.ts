import { customAlphabet } from 'nanoid';

export const nanoidAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const nanoidLength = 10;

const nanoid = customAlphabet(nanoidAlphabet, nanoidLength);

export const createId = () => nanoid();
