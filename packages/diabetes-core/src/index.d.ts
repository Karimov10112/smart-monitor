export interface GlycemicThresholds {
  veryLow?: number;
  low?: number;
  targetMin?: number;
  targetMax?: number;
  high?: number;
  veryHigh?: number;
}

export interface BloodSugarRecord {
  date?: Date | string;
  fastingLevel?: number;
  postMealLevel?: number;
  glucose?: number;
  value?: number;
  systolicPressure?: number;
  diastolicPressure?: number;
  pulse?: number;
  exercise?: boolean;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  medication?: boolean;
  medicationName?: string;
}

export interface PatientProfile {
  firstName?: string;
  lastName?: string;
  age?: number;
  dateOfBirth?: Date | string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  bmi?: number;
  diabetesType?: 'type1' | 'type2' | 'gestational' | 'prediabetes';
  diabetesYears?: number;
  durationYears?: number;
  hba1c?: number;
  systolicPressure?: number;
  diastolicPressure?: number;
  lang?: 'uz' | 'en' | 'ru';
}

export interface FINDRISCResult {
  totalScore: number;
  maxScore: number;
  riskLevel: 'LOW' | 'SLIGHTLY_ELEVATED' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  tenYearProbabilityPercent: number;
  bmiCalculated: number;
  description: string;
  recommendations: string[];
}

export function parseGlucoseCSV(
  csvText: string,
  options?: { unit?: 'auto' | 'mmol/L' | 'mg/dL' }
): BloodSugarRecord[];

export function calculateFINDRISC(
  data: {
    age?: number;
    bmi?: number;
    weight?: number;
    height?: number;
    waistCircumference?: number;
    gender?: 'male' | 'female';
    physicalActivityDaily?: boolean;
    eatVegetablesDaily?: boolean;
    takesBloodPressureMeds?: boolean;
    hasHighBloodGlucoseHistory?: boolean;
    familyHistory?: 'none' | 'second_degree' | 'first_degree';
  },
  lang?: 'uz' | 'en' | 'ru'
): FINDRISCResult;

export function generateDoctorReportHTML(
  profile: PatientProfile,
  records: BloodSugarRecord[],
  options?: {
    lang?: 'uz' | 'en' | 'ru';
    clinicName?: string;
    doctorName?: string;
  }
): string;

export function calculateGlycemicMetrics(
  records: BloodSugarRecord[],
  options?: { lang?: 'uz' | 'en' | 'ru'; unit?: 'auto' | 'mmol/L' | 'mg/dL'; thresholds?: GlycemicThresholds }
): any;

export function assessFullDiabetesRisk(
  profile: PatientProfile,
  records: BloodSugarRecord[],
  options?: { lang?: 'uz' | 'en' | 'ru'; unit?: 'auto' | 'mmol/L' | 'mg/dL' }
): any;

export function getNutritionAdvice(params: any): any;
export function evaluateDoctorAlert(params: any): any;
export function analyzeLifestyleImpact(records: BloodSugarRecord[], lang?: string): any;
export function generateRecommendedSchedule(params: any): any;
export function buildMedicalAIContext(params: any): any;
export function calculateBolusDose(params: any): any;

export function mmolToMgDl(mmolL: number): number | null;
export function mgDlToMmol(mgDl: number): number | null;
export function normalizeToMmol(value: number, unit?: string): number | null;
export function calculateBMI(weight: number, height: number): number | null;
export function calculateAge(dateOfBirth: Date | string): number | null;

export function parseFHIRObservations(fhirObservations: any[]): BloodSugarRecord[];
export function toFHIRRiskAssessment(riskResult: any, patientId?: string): any;
