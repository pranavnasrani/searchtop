export interface Scores {
  performance: number;
  battery: number;
  build_quality: number;
  display: number;
  audio: number;
  portability: number;
}

export type Weights = Scores;

export interface Laptop {
  id: string;
  name: string;
  brand: string;
  price: number;
  release_date: string;
  image_urls: string[];
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  display: string;
  battery: string;
  build: string;
  audio: string;
  ports: string;
  scores: Scores;
  last_updated: Date;
  weightedScore?: number;
}

export interface Filters {
  price: {
    min: number;
    max: number;
  };
  brands: string[];
  displaySizes: number[];
  gpus: string[];
}

export interface WebSearchResult {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: WebSearchResult;
}