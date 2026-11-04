import type { ImageSourcePropType } from 'react-native';
import { mediaImageSource } from '../lib/mediaStore';

export const KOJA_IMAGES = {
  fondation: require('../../assets/koja/fondation.jpg'),
  valeurs: require('../../assets/koja/valeurs.jpg'),
  k2th: require('../../assets/koja/k2th.jpg'),
  camp: require('../../assets/koja/camp.jpg'),
} satisfies Record<string, ImageSourcePropType>;

export function getKojaImage(key: string): ImageSourcePropType {
  return KOJA_IMAGES[key as keyof typeof KOJA_IMAGES] ?? KOJA_IMAGES.fondation;
}

export function getKojaCover(imageKey: string, coverKey: string): ImageSourcePropType {
  return mediaImageSource(coverKey) ?? getKojaImage(imageKey);
}
