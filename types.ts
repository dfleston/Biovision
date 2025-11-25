export interface Animal {
  id: string;
  name: string;
  emoji: string;
  scientificName?: string;
}

export interface VisionPerspective {
  scientificDescription: string;
  visualFeatures: string[];
  imagePrompt: string;
  imageUrl?: string;
  isLoadingImage?: boolean;
}

export interface SimulationResult {
  animalA: Animal;
  animalB: Animal;
  perspectiveA: VisionPerspective; // How A sees B
  perspectiveB: VisionPerspective; // How B sees A
}

export interface GenerateVisionResponse {
  perspectiveA: {
    scientificDescription: string;
    visualFeatures: string[];
    imagePrompt: string;
  };
  perspectiveB: {
    scientificDescription: string;
    visualFeatures: string[];
    imagePrompt: string;
  };
}

export interface AppSettings {
  apiKey: string;
  textModel: string;
  imageModel: string;
}