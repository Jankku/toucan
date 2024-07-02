import browserImageCompression, { Options } from 'browser-image-compression';

const defaultOptions = {
  useWebWorker: true,
  libURL: new URL('browser-image-compression/dist/browser-image-compression.js', import.meta.url)
    .href,
  preserveExif: true,
  maxIteration: 3,
  maxSizeMB: 5,
} satisfies Options;

const bytesToMB = (bytes: number) => bytes / 1024 / 1024;

export const compress = async (file: File, options?: Options): Promise<Blob> => {
  if (!options?.maxWidthOrHeight && bytesToMB(file.size) <= defaultOptions.maxSizeMB) {
    return file;
  }

  return await browserImageCompression(file, {
    ...defaultOptions,
    ...options,
  });
};

type BlobToFileOptions = FilePropertyBag & {
  name: string;
};

export const blobToFile = (blob: Blob, options: BlobToFileOptions): File => {
  return new File([blob], options.name, options);
};
