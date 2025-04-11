export interface MoviePredictionResponse {
  success: boolean;
  probability: number;
  confidenceLevel: string;
  recommendations?: string[];
  factors?: {
    seasonalImpact: number;
  };
}
