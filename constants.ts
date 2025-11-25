import { Animal } from './types';

export const ANIMALS: Animal[] = [
  { id: 'human', name: 'Human', emoji: '👨‍🔬', scientificName: 'Homo sapiens' },
  { id: 'dog', name: 'Dog', emoji: '🐕', scientificName: 'Canis lupus familiaris' },
  { id: 'cat', name: 'Cat', emoji: '🐈', scientificName: 'Felis catus' },
  { id: 'eagle', name: 'Eagle', emoji: '🦅', scientificName: 'Aquila chrysaetos' },
  { id: 'fly', name: 'House Fly', emoji: '🪰', scientificName: 'Musca domestica' },
  { id: 'bee', name: 'Honey Bee', emoji: '🐝', scientificName: 'Apis mellifera' },
  { id: 'snake', name: 'Pit Viper', emoji: '🐍', scientificName: 'Crotalinae' },
  { id: 'shark', name: 'Shark', emoji: '🦈', scientificName: 'Selachimorpha' },
  { id: 'frog', name: 'Frog', emoji: '🐸', scientificName: 'Anura' },
  { id: 'cow', name: 'Cow', emoji: '🐄', scientificName: 'Bos taurus' },
  { id: 'spider', name: 'Jumping Spider', emoji: '🕷️', scientificName: 'Salticidae' },
  { id: 'bat', name: 'Bat', emoji: '🦇', scientificName: 'Chiroptera' },
];

export const PLACEHOLDER_IMAGE = "https://picsum.photos/600/600";

export const TEXT_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Fast & Efficient)' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro (High Reasoning)' },
];

export const IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image (Fast)' },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image (High Quality)' },
];