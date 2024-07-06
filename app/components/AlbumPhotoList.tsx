import {
  Box,
  Checkbox,
  CheckboxGroup,
  Flex,
  IconButton,
  SimpleGrid,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { AlbumPhoto } from './AlbumPhoto';
import { PhotoWithUrl } from '~/utils/zod-schema';
import { ChangeEvent, useState } from 'react';
import { useCheckbox } from '~/hooks/useCheckbox';
import { DeleteIcon } from '@chakra-ui/icons';

type AlbumPhotoListProps = {
  photos: PhotoWithUrl[];
  onDeletePhotos: (photoIds: string[]) => void;
};

export function AlbumPhotoList({ photos, onDeletePhotos }: AlbumPhotoListProps) {
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const selectAllCheckbox = useCheckbox({ data: photos, checkedValues: selectedImageIds });

  const onSelectAllImages = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    if (value) {
      const allIds = photos.map((photo) => photo.photo_id);
      setSelectedImageIds(allIds);
    } else {
      setSelectedImageIds([]);
    }
  };

  const onSelectImage = (values: string[]) => {
    setSelectedImageIds(values);
  };

  const onDeleteClick = async () => {
    onDeletePhotos(selectedImageIds);
    setSelectedImageIds([]);
  };

  return (
    <>
      {selectedImageIds.length > 0 ? (
        <Box p={4} bg="orange.50" border="1px solid" borderColor="orange.200" fontWeight={500}>
          <Flex alignItems="center" justify="space-between">
            <Flex gap={4}>
              <Checkbox
                aria-label="Select all photos"
                isChecked={selectAllCheckbox.isChecked}
                isIndeterminate={selectAllCheckbox.isIndeterminate}
                onChange={onSelectAllImages}
              />
              <Text>{selectedImageIds.length} photos selected</Text>
            </Flex>
            <Tooltip hasArrow label={`Delete ${selectedImageIds.length} images`}>
              <IconButton
                icon={<DeleteIcon />}
                aria-label={`Delete ${selectedImageIds.length} images`}
                onClick={onDeleteClick}
              />
            </Tooltip>
          </Flex>
        </Box>
      ) : undefined}

      <CheckboxGroup value={selectedImageIds} onChange={onSelectImage}>
        <SimpleGrid columns={[1, 2, 3]} gap={4}>
          {photos.map(({ photo_id, url, name, blurhash }) => (
            <AlbumPhoto key={photo_id} id={photo_id} src={url} alt={name} blurhash={blurhash} />
          ))}
        </SimpleGrid>
      </CheckboxGroup>
    </>
  );
}
