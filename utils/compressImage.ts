import { ImagePickerAsset } from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_EDGE = 1080;
const JPEG_QUALITY = 0.8;

function isImageAsset(asset: ImagePickerAsset): boolean {
  if (asset.type === 'video') return false;
  return true;
}

async function compressOne(asset: ImagePickerAsset): Promise<ImagePickerAsset> {
  if (!isImageAsset(asset)) return asset;

  const { width = 0, height = 0 } = asset;
  const longestEdge = Math.max(width, height);
  const actions: ImageManipulator.Action[] =
    longestEdge > MAX_EDGE
      ? [width >= height ? { resize: { width: MAX_EDGE } } : { resize: { height: MAX_EDGE } }]
      : [];

  const result = await ImageManipulator.manipulateAsync(asset.uri, actions, {
    compress: JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return {
    ...asset,
    uri: result.uri,
    width: result.width,
    height: result.height,
    fileName: asset.fileName?.replace(/\.[^.]+$/, '.jpg') ?? 'image.jpg',
    mimeType: 'image/jpeg',
    fileSize: undefined,
  };
}

export async function compressImages(assets: ImagePickerAsset[]): Promise<ImagePickerAsset[]> {
  return Promise.all(assets.map(compressOne));
}

export async function compressImage(asset: ImagePickerAsset): Promise<ImagePickerAsset> {
  return compressOne(asset);
}
