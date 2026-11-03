/**
 * 1. Node.js orqali integratsiya qilish namunasi
 * Boshqa dasturchi sizning API'ingizga quyidagicha so'rov yuboradi:
 */

const API_BASE_URL = 'http://localhost:5000/api/v1/integration'; // Yoki https://sizning-domeningiz.uz/api/v1/integration

async function assessPatientDiabetes() {
  const payload = {
    patientProfile: {
      age: 56,
      gender: 'female',
      height: 162,
      weight: 79,
      diabetesType: 'type2',
      diabetesYears: 7,
      systolicPressure: 142,
      diastolicPressure: 88
    },
    records: [
      { fastingLevel: 7.8, postMealLevel: 11.2 },
      { fastingLevel: 8.4, postMealLevel: 13.1 },
      { fastingLevel: 6.9, postMealLevel: 9.8 }
    ]
  };

  try {
    const response = await fetch(`${API_BASE_URL}/assess-risk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('--- DIABETES RISK INTEGRATION RESULT ---');
    console.log('Umumiy xavf darajasi:', result.data.overallAssessment.level);
    console.log('Hisoblangan eA1c:', result.data.glycemicMetrics.estimatedA1C);
    console.log('Retinopatiya (ko\'z):', result.data.complications.retinopathy);
    console.log('Nefropatiya (buyrak):', result.data.complications.nephropathy);
    console.log('Yurak-qon tomir:', result.data.complications.cardiovascular);
    console.log('Neyropatiya (oyoq):', result.data.complications.neuropathy);
  } catch (error) {
    console.error('Integratsiya xatosi:', error);
  }
}

assessPatientDiabetes();

