import { encode } from 'blurhash';

const getImageData = (image: ImageBitmap) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

export const encodeImageToBlurhash = async (image: ImageBitmap) => {
  const imageData = getImageData(image);
  return encode(imageData.data, imageData.width, imageData.height, 4, 3);
};
