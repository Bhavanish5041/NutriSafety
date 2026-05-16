export type RiskLevel = "safe" | "moderate" | "avoid";

export type HealthCondition =
  | "diabetes"
  | "hypertension"
  | "lactose_intolerance"
  | "kidney_disease"
  | "high_protein"
  | "vegan"
  | "gluten_intolerance"
  | "low_sugar";

export type HealthProfile = {
  conditions: HealthCondition[];
  age?: number;
  notes?: string;
};

export type Product = {
  barcode?: string;
  name: string;
  brand?: string;
  image?: string;
  ingredients: string[];
  ingredientsText?: string;
  allergens: string[];
  certifications: string[];
  claims: string[];
  nutrition: {
    energyKcal?: number;
    sugar?: number;
    sodium?: number;
    protein?: number;
    fat?: number;
    saturatedFat?: number;
    carbohydrates?: number;
    fiber?: number;
  };
  ecoScore?: string;
  novaScore?: number;
};

export type IngredientExplanation = {
  ingredient: string;
  purpose: string;
  explanation: string;
  sideEffects: string;
  classification: "additive" | "preservative" | "artificial" | "natural" | "unknown";
};

export type HealthRiskAnalysis = {
  healthScore: number;
  riskLevel: RiskLevel;
  badges: string[];
  warnings: string[];
  summary: string;
};

export type HiddenHarm = {
  title: string;
  severity: RiskLevel;
  description: string;
};

export type ComplianceResult = {
  region: "FDA" | "FSSAI" | "EFSA";
  status: "Allowed" | "Restricted" | "Monitor" | "Unknown";
  notes: string[];
};
