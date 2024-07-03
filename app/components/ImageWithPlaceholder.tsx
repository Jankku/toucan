import { AspectRatio, Image, ImageProps } from '@chakra-ui/react';
import { Blurhash } from 'react-blurhash';

interface ImageWithPlaceholderProps extends Omit<ImageProps, 'src'> {
  src?: string;
  blurhash?: string;
}

export function ImageWithPlaceholder({
  src = 'https://placehold.co/1x1/fefaf0/fefaf0/jpg',
  blurhash,
  ...props
}: ImageWithPlaceholderProps) {
  return (
    <Image
      {...props}
      src={src}
      aspectRatio={1}
      fit="cover"
      borderRadius="md"
      width="100%"
      fallback={
        blurhash ? (
          <AspectRatio ratio={1}>
            <div>
              <Blurhash height={'100%'} width={'100%'} hash={blurhash} />
            </div>
          </AspectRatio>
        ) : undefined
      }
    />
  );
}
