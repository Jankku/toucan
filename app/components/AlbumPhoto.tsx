import { Card, Checkbox, Image } from '@chakra-ui/react';
import { Blurhash } from 'react-blurhash';

type AlbumPhotoProps = {
  id: string;
  src: string;
  alt: string;
  blurhash: string;
};

export function AlbumPhoto({ id, src, alt, blurhash }: AlbumPhotoProps) {
  return (
    <Card variant="surface">
      <Checkbox
        value={id}
        aria-label={`Select ${alt}`}
        size="lg"
        position="absolute"
        top={1}
        left={1}
      />
      <Image
        src={src}
        alt={alt}
        aspectRatio={4 / 3}
        objectFit="cover"
        fallback={<Blurhash hash={blurhash} width="100%" height="100%" />}
        loading="lazy"
      />
    </Card>
  );
}
