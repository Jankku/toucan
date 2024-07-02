import { Box, Input, InputProps, Text } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone-esm';
import { encodeImageToBlurhash } from '~/utils/blurhash';
import { blobToFile, compress } from '~/utils/file';
import { createId } from '~/utils/nanoid';

export type Picture = {
  picture_id: string;
  file: File;
  thumbnail: File;
  blurhash: string;
};

type Props = {
  onCompressed: (pictures: Picture[]) => void;
};

const createBlurHash = async (file: File) => {
  const smallImage = await compress(file, { maxWidthOrHeight: 32 });
  const bitmap = await createImageBitmap(smallImage);
  return encodeImageToBlurhash(bitmap);
};

const imageToPicture = async (file: File): Promise<Picture> => {
  const [originalBlob, thumbnailBlob, blurhash] = await Promise.all([
    compress(file, { maxSizeMB: 10 }),
    compress(file, {
      maxWidthOrHeight: 400,
      preserveExif: false,
      fileType: 'image/webp',
      initialQuality: 0.8,
    }),
    createBlurHash(file),
  ]);

  const newFile = blobToFile(originalBlob, {
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
  });
  const thumbnail = blobToFile(thumbnailBlob, {
    name: file.name,
    type: 'image/webp',
  });

  return { picture_id: createId(), file: newFile, thumbnail, blurhash };
};

export function FileUpload({ onCompressed }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    },
    onDrop: async (acceptedFiles: File[]) => {
      const pictures = await Promise.allSettled(acceptedFiles.map(imageToPicture));

      const successfulPictures = pictures
        .filter((p) => p.status === 'fulfilled')
        .map((p) => p.value);
      const failedPictureReasons = pictures
        .filter((p) => p.status === 'rejected')
        .map((p) => p.reason);

      if (failedPictureReasons.length > 0) {
        console.error('Failed to upload pictures:', failedPictureReasons);
      }

      onCompressed(successfulPictures);
    },
  });
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
      <Input {...(getInputProps() as InputProps)} />
      {isDragActive ? (
        <Text>Drop the files here ...</Text>
      ) : (
        <Text>Drag and drop some files here, or click to select files</Text>
      )}
    </Box>
  );
}
