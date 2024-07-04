import { Box, Input, InputProps, Text } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone-esm';
import { encodeImageToBlurhash } from '~/utils/blurhash';
import { blobToFile, compress } from '~/utils/file';
import { createId } from '~/utils/nanoid';

export type Photo = {
  photo_id: string;
  file: File;
  thumbnail: File;
  blurhash: string;
};

const createBlurHash = async (file: File) => {
  const smallImage = await compress(file, { maxWidthOrHeight: 32 });
  const bitmap = await createImageBitmap(smallImage);
  return encodeImageToBlurhash(bitmap);
};

const imageToPhoto = async (file: File): Promise<Photo> => {
  const [originalBlob, thumbnailBlob, blurhash] = await Promise.all([
    compress(file, { maxSizeMB: 10 }),
    compress(file, {
      maxWidthOrHeight: 600,
      preserveExif: false,
      fileType: 'image/webp',
      initialQuality: 0.8,
    }),
    createBlurHash(file),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newFile = blobToFile(originalBlob, {
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
  });

  const thumbnail = blobToFile(thumbnailBlob, {
    name: file.name,
    type: 'image/webp',
  });

  // TODO: change file to newFile, upload both the original and the thumbnail
  return { photo_id: createId(), file: thumbnail, thumbnail, blurhash };
};

type FileUploadProps = {
  isUploading: boolean;
  onCompressed: (photos: Photo[]) => void;
};

export function FileUpload({ isUploading, onCompressed }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    },
    onDrop: async (acceptedFiles: File[]) => {
      const photos = await Promise.allSettled(acceptedFiles.map(imageToPhoto));

      const successfulPhotos = photos.filter((p) => p.status === 'fulfilled').map((p) => p.value);
      const failedPhotoReasons = photos.filter((p) => p.status === 'rejected').map((p) => p.reason);

      if (failedPhotoReasons.length > 0) {
        console.error('Failed to upload photos:', failedPhotoReasons);
      }

      onCompressed(successfulPhotos);
    },
  });

  const fileUploadText = isUploading
    ? 'Uploading...'
    : isDragActive
      ? 'Drop the photos here...'
      : 'Drag and drop some photos here, or click to select photos';

  return (
    <Box
      {...getRootProps()}
      px={4}
      py={8}
      textAlign="center"
      backgroundColor="orange.50"
      borderWidth={3}
      borderRadius={8}
      borderStyle="dashed"
      borderColor="orange.500"
      cursor="pointer"
    >
      <Input {...(getInputProps() as InputProps)} disabled={isUploading} />
      <Text>{fileUploadText}</Text>
    </Box>
  );
}
