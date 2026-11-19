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

// ─── v1.4.0: sutkalik glikemik profil, dinamika, validatsiya, integratsiya ───

export type Lang = 'uz' | 'ru' | 'en';
export type ProfilePointId = 'fasting' | 'post_breakfast' | 'pre_lunch' | 'post_lunch' | 'pre_dinner' | 'bedtime';

export interface GlycemicMetrics {
  totalReadings: number;
  meanGlucose: number;
  meanGlucoseMgDl?: number;
  estimatedA1C: number;
  glucoseManagementIndicator?: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  stability: 'STABLE' | 'UNSTABLE' | 'UNKNOWN';
  timeInRange: { tir: number; tar: number; tbr: number; veryHigh: number; veryLow: number };
  recommendations: string[];
}

export interface ProfilePlanPoint {
  order: number;
  id: ProfilePointId;
  time: string;
  instruction: string;
  target: { min: number; max: number };
  type1Only: boolean;
  required: boolean;
}

export const GLYCEMIC_PROFILE_POINTS: ReadonlyArray<{ id: ProfilePointId; time: string; target: { min: number; max: number }; type1Only?: boolean }>;

export function buildGlycemicProfilePlan(params?: {
  diabetesType?: PatientProfile['diabetesType'];
  treatmentType?: 'insulin' | 'oral_meds' | 'combined' | 'lifestyle_only';
  includeAll?: boolean;
  lang?: Lang;
}): { title: string; advice: string; points: ProfilePlanPoint[]; totalPoints: number };

export function needsGlycemicProfile(reading: BloodSugarRecord & { unit?: string; lang?: Lang }): {
  required: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'NONE';
  reason: string | null;
  value: number | null;
};

export interface ProfilePattern {
  code: 'HYPOGLYCEMIA' | 'FASTING_HYPERGLYCEMIA' | 'POSTPRANDIAL_SPIKE' | 'NOCTURNAL_HYPO_RISK' | 'BEDTIME_HIGH' | 'HIGH_VARIABILITY' | 'ALL_IN_TARGET';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
}

export function analyzeGlycemicProfile(
  measurements: Array<{ point: ProfilePointId; value: number }> | Partial<Record<ProfilePointId, number>>,
  options?: { lang?: Lang; unit?: string; diabetesType?: PatientProfile['diabetesType']; treatmentType?: string }
): {
  title: string;
  complete: boolean;
  completeness: number;
  missingNote: string | null;
  points: Array<{ id: ProfilePointId; time: string; instruction: string; target: { min: number; max: number }; value: number | null; status: 'LOW' | 'BELOW_TARGET' | 'IN_TARGET' | 'HIGH' | 'MISSING'; required: boolean }>;
  summary: { measured: number; meanGlucose: number | null; amplitude: number | null; timeInTargetPercent: number | null; min: number | null; max: number | null };
  patterns: ProfilePattern[];
  shouldNotifyDoctor: boolean;
  overall: 'CRITICAL' | 'NEEDS_ATTENTION' | 'GOOD' | 'NO_DATA';
};

export interface TrendResult {
  direction: 'IMPROVING' | 'WORSENING' | 'STABLE' | 'INSUFFICIENT_DATA';
  slopePerWeek: number | null;
  confidence?: number;
  message: string;
  periodDays?: number;
  current: { readings: number; meanGlucose: number; tir: number } | null;
  previous: { readings: number; meanGlucose: number; tir: number } | null;
  change: { meanGlucose: number; tir: number } | null;
  readings: number;
}
export function analyzeGlucoseTrend(records: BloodSugarRecord[], options?: { periodDays?: number; lang?: Lang; unit?: string; now?: Date | number }): TrendResult;
export function detectHypoglycemiaEpisodes(records: BloodSugarRecord[], options?: { unit?: string }): Array<{ date: string; value: number; level: 1 | 2; kind: string }>;

export interface ValidationError { field: string; code: string; message: string }
export const PHYSIOLOGICAL_LIMITS: Record<string, { min: number; max: number }>;
export function validateRecord(record: unknown, options?: { lang?: Lang; unit?: string; requireGlucose?: boolean }): { valid: boolean; errors: ValidationError[]; normalized: BloodSugarRecord | null };
export function sanitizeRecords(records: unknown[], options?: { lang?: Lang; unit?: string }): { records: BloodSugarRecord[]; rejected: Array<{ index: number; errors: ValidationError[] }> };

export interface HandlerResult { status: number; body: { success: boolean; data?: any; error?: { code: string; message: string; details?: any }; rejected?: any[] } }
export type Handler = (body: any) => HandlerResult;
export function createDiabetesHandlers(options?: { defaultLang?: Lang; onAlert?: (alert: any, body: any) => void }): {
  metrics: Handler; risk: Handler; alert: Handler; profilePlan: Handler; profileAnalyze: Handler; trend: Handler; findrisc: Handler; bolus: Handler; fhir: Handler;
};
export function createExpressRouter(express: any, options?: { defaultLang?: Lang; onAlert?: (alert: any, body: any) => void; basePath?: string }): any;
export function getOpenAPISpec(options?: { serverUrl?: string; title?: string }): Record<string, any>;

export interface MonitorEvent { reading: BloodSugarRecord; patient: any; alert: any; glycemicProfile: ReturnType<typeof needsGlycemicProfile>; at: string }
export interface PatientMonitor {
  ingest(reading: BloodSugarRecord, patient?: { firstName?: string; lastName?: string; name?: string; [k: string]: any }): { accepted: boolean; errors?: ValidationError[]; alert?: any; glycemicProfile?: any };
  on(event: 'reading' | 'critical' | 'profile-required', listener: (e: MonitorEvent) => void): this;
  on(event: 'invalid', listener: (e: { reading: any; errors: ValidationError[]; patient: any }) => void): this;
  on(event: 'error-webhook', listener: (e: Error) => void): this;
}
export function createPatientMonitor(options?: { lang?: Lang; webhookUrl?: string; webhookSecret?: string; fetch?: (...args: any[]) => Promise<any> }): PatientMonitor;
export function signPayload(payload: string | object, secret: string): string;
export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
export function sendWebhook(url: string, payload: object, options?: { secret?: string; fetch?: (...args: any[]) => Promise<any>; timeoutMs?: number }): Promise<{ ok: boolean; status: number }>;

export const VERSION: string;
