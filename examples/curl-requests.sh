#!/bin/bash
# cURL orqali integratsiya interfeyslariga so'rov yuborish misollari

# 1. API hujjatlarini olish
curl -X GET http://localhost:5000/api/v1/integration/docs

# 2. Glisemik ko'rsatkichlarni hisoblash (TIR, TAR, TBR)
curl -X POST http://localhost:5000/api/v1/integration/glycemic-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      { "fastingLevel": 6.2, "postMealLevel": 8.5 },
      { "fastingLevel": 7.4, "postMealLevel": 11.0 }
    ]
  }'

# 3. Asoratlar xavfini baholash (Retinopatiya, Nefropatiya, Yurak xavfi)
curl -X POST http://localhost:5000/api/v1/integration/assess-risk \
  -H "Content-Type: application/json" \
  -d '{
    "patientProfile": {
      "age": 55,
      "gender": "male",
      "height": 175,
      "weight": 86,
      "diabetesType": "type2",
      "diabetesYears": 6,
      "systolicPressure": 140,
      "diastolicPressure": 90
    },
    "records": [
      { "fastingLevel": 7.5, "postMealLevel": 11.8 }
    ]
  }'

