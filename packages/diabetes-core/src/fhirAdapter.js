/**
 * HL7 FHIR (Fast Healthcare Interoperability Resources - Release 4) Adapteri
 * Tibbiyot axborot tizimlari (MIS/EHR) bilan o'zaro integratsiyani ta'minlaydi.
 */

const { assessFullDiabetesRisk } = require('./riskModels');

/**
 * FHIR Observation resurslaridan qon shakari va qon bosimi o'lchovlarini oddiy yozuvlarga aylantiradi
 * @param {Array<Object>} fhirObservations - FHIR Observation resurslari
 */
function parseFHIRObservations(fhirObservations = []) {
  const records = [];

  fhirObservations.forEach(obs => {
    if (!obs || obs.resourceType !== 'Observation') return;

    // LOINC kodlari:
    // 15074-8: Glucose [Moles/volume] in Blood
    // 2339-0: Glucose [Mass/volume] in Blood
    // 8480-6: Systolic blood pressure
    // 8462-4: Diastolic blood pressure
    const coding = obs.code?.coding || [];
    const isGlucose = coding.some(c => c.code === '15074-8' || c.code === '2339-0' || c.display?.toLowerCase().includes('glucose'));
    const isBloodPressure = coding.some(c => c.code === '85354-9' || c.display?.toLowerCase().includes('blood pressure'));

    const effectiveDate = obs.effectiveDateTime ? new Date(obs.effectiveDateTime) : new Date();

    if (isGlucose) {
      let val = obs.valueQuantity?.value;
      const unit = obs.valueQuantity?.unit || 'mmol/L';
      // Agar mg/dL da bo'lsa, mmol/L ga o'tkazish
      if (unit.toLowerCase().includes('mg') && val) {
        val = Number((val / 18.0182).toFixed(2));
      }
      records.push({
        date: effectiveDate,
        fastingLevel: val,
        glucose: val
      });
    } else if (isBloodPressure && obs.component) {
      let sys = null;
      let dia = null;
      obs.component.forEach(comp => {
        const cCode = comp.code?.coding?.[0]?.code;
        if (cCode === '8480-6') sys = comp.valueQuantity?.value;
        if (cCode === '8462-4') dia = comp.valueQuantity?.value;
      });
      records.push({
        date: effectiveDate,
        systolicPressure: sys,
        diastolicPressure: dia
      });
    }
  });

  return records;
}

/**
 * Tahlil natijasini FHIR R4 RiskAssessment resursi formatiga o'tkazadi
 * @param {Object} riskResult - assessFullDiabetesRisk natijasi
 * @param {string} patientId - Bemor identifikatori
 */
function toFHIRRiskAssessment(riskResult, patientId = 'unknown') {
  const fhirAssessment = {
    resourceType: 'RiskAssessment',
    id: `risk-eval-${Date.now()}`,
    status: 'final',
    subject: {
      reference: `Patient/${patientId}`
    },
    occurrenceDateTime: riskResult.calculatedAt,
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '73211009',
          display: 'Diabetes mellitus (disorder) complication risk'
        }
      ],
      text: 'Qandli diabet asoratlari xavfini baholash'
    },
    prediction: [
      {
        outcome: {
          text: 'Diabetik retinopatiya'
        },
        probabilityDecimal: Number((riskResult.complications.retinopathy.riskPercent / 100).toFixed(2)),
        qualitativeRisk: {
          coding: [{ code: riskResult.complications.retinopathy.level }]
        },
        rationale: riskResult.complications.retinopathy.description
      },
      {
        outcome: {
          text: 'Diabetik nefropatiya'
        },
        probabilityDecimal: Number((riskResult.complications.nephropathy.riskPercent / 100).toFixed(2)),
        qualitativeRisk: {
          coding: [{ code: riskResult.complications.nephropathy.level }]
        },
        rationale: riskResult.complications.nephropathy.description
      },
      {
        outcome: {
          text: 'Kardiovaskulyar asoratlar'
        },
        probabilityDecimal: Number((riskResult.complications.cardiovascular.riskPercent / 100).toFixed(2)),
        qualitativeRisk: {
          coding: [{ code: riskResult.complications.cardiovascular.level }]
        },
        rationale: riskResult.complications.cardiovascular.description
      },
      {
        outcome: {
          text: 'Diabetik neyropatiya / Diabetik tovon'
        },
        probabilityDecimal: Number((riskResult.complications.neuropathy.riskPercent / 100).toFixed(2)),
        qualitativeRisk: {
          coding: [{ code: riskResult.complications.neuropathy.level }]
        },
        rationale: riskResult.complications.neuropathy.description
      }
    ],
    note: [
      {
        text: `TIR: ${riskResult.glycemicMetrics.timeInRange.tir}%, eA1c: ${riskResult.glycemicMetrics.estimatedA1C}%`
      }
    ]
  };

  return fhirAssessment;
}

module.exports = {
  parseFHIRObservations,
  toFHIRRiskAssessment
};

