export type MediaType = 'image' | 'audio' | 'video';

export interface MediaFile {
  id: string;
  type: MediaType;
  file: File;
  url: string;
  thumbnail?: string;
}

export interface MediaPreview {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  name: string;
  size: number;
}

export const ACCEPTED_MEDIA_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'],
  video: ['video/mp4', 'video/webm', 'video/ogg']
};

export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  audio: 10 * 1024 * 1024, // 10MB
  video: 20 * 1024 * 1024 // 20MB
}; 