"""
Qandli diabet asoratlari xavfini baholash API'si bilan Python orqali integratsiya qilish namunasi.
O'rnatish: pip install requests
"""

import requests
import json

API_URL = "http://localhost:5000/api/v1/integration/assess-risk"

# Bemor ma'lumotlari
patient_data = {
    "patientProfile": {
        "age": 49,
        "gender": "male",
        "height": 178,
        "weight": 92,
        "diabetesType": "type2",
        "diabetesYears": 5,
        "systolicPressure": 138,
        "diastolicPressure": 86
    },
    "records": [
        {"fastingLevel": 7.1, "postMealLevel": 10.4},
        {"fastingLevel": 6.8, "postMealLevel": 9.2},
        {"fastingLevel": 8.0, "postMealLevel": 12.5}
    ]
}

def check_diabetes_risk():
    try:
        response = requests.post(API_URL, json=patient_data, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        data = response.json()
        
        print("--- PYTHON INTEGRATION RESULT ---")
        assessment = data.get("data", {})
        overall = assessment.get("overallAssessment", {})
        print(f"Umumiy xavf: {overall.get('level')} ({overall.get('score')} ball)")
        
        complications = assessment.get("complications", {})
        print(f"Ko'z xavfi: {complications.get('retinopathy', {}).get('riskPercent')}%")
        print(f"Buyrak xavfi: {complications.get('nephropathy', {}).get('riskPercent')}%")
        print(f"Yurak xavfi: {complications.get('cardiovascular', {}).get('riskPercent')}%")
        print(f"Neyropatiya: {complications.get('neuropathy', {}).get('riskPercent')}%")
    except Exception as e:
        print(f"Xatolik: {e}")

if __name__ == "__main__":
    check_diabetes_risk()

