/**
 * Shifokor va bemor uchun klinika tibbiy hisoboti generatori (HTML / PDF Ready)
 */

const { calculateGlycemicMetrics } = require('./metrics');
const { assessFullDiabetesRisk } = require('./riskModels');

/**
 * Bemor holati bo'yicha chop etishga tayyor chiroyli HTML tibbiy hisobot generatsiya qiladi
 * @param {Object} profile - Bemor profili
 * @param {Array<Object>} records - Qon shakari yozuvlari
 * @param {Object} [options]
 * @param {'uz'|'en'|'ru'} [options.lang='uz']
 * @param {string} [options.clinicName='Diabet Med Monitoring Markazi']
 * @param {string} [options.doctorName='Navbatchi Endokrinolog']
 * @returns {string} To'liq mustaqil HTML sahifa kodi
 */
function generateDoctorReportHTML(profile = {}, records = [], options = {}) {
  const lang = options.lang || 'uz';
  const clinicName = options.clinicName || (lang === 'uz' ? 'Diabet Med Monitoring Markazi' : 'Diabetes Clinical Center');
  const doctorName = options.doctorName || (lang === 'uz' ? 'Davolovchi shifokor' : 'Attending Physician');

  const metrics = calculateGlycemicMetrics(records, { lang });
  const risk = assessFullDiabetesRisk(profile, records, { lang });

  const patientName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || (lang === 'uz' ? 'Bemor' : 'Patient');
  const reportDate = new Date().toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US');

  // Asoratlar ranglari
  const getBadgeColor = lvl => {
    if (lvl === 'CRITICAL' || lvl === 'HIGH') return '#ef4444';
    if (lvl === 'MODERATE') return '#f59e0b';
    return '#10b981';
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>Tibbiy Hisobot — ${patientName}</title>
  <style>
    @media print {
      body { padding: 0; background: #fff; }
      .no-print { display: none; }
      .page-card { box-shadow: none !important; border: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      margin: 0;
      padding: 30px 15px;
    }
    .page-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 36px 44px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .clinic-title { font-size: 20px; font-weight: bold; color: #1e40af; }
    .report-date { font-size: 13px; color: #64748b; }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #334155;
      margin-top: 24px;
      margin-bottom: 12px;
      border-left: 4px solid #3b82f6;
      padding-left: 10px;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .info-box {
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .info-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .info-val { font-size: 16px; font-weight: 600; color: #0f172a; }
    .metric-card {
      text-align: center;
      background: #f8fafc;
      padding: 14px 10px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .metric-val { font-size: 22px; font-weight: 800; color: #2563eb; }
    .metric-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
    .risk-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
    }
    .rec-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 14px 18px;
      border-radius: 6px;
      margin-top: 16px;
      font-size: 14px;
      line-height: 1.6;
    }
    .btn-print {
      display: inline-block;
      background: #2563eb;
      color: #fff;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      border: none;
      margin-bottom: 20px;
    }
    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div style="max-width: 820px; margin: 0 auto;" class="no-print">
    <button class="btn-print" onclick="window.print()">🖨 Chop etish (Print / PDF saqlash)</button>
  </div>

  <div class="page-card">
    <div class="header">
      <div>
        <div class="clinic-title">${clinicName}</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 3px;">Klinik Diabetologik Tahlil va Asoratlar Xavfi Hisoboti</div>
      </div>
      <div class="report-date">Sana: ${reportDate}</div>
    </div>

    <!-- Bemor ma'lumotlari -->
    <div class="grid-2">
      <div class="info-box">
        <div class="info-label">Bemor F.I.Sh</div>
        <div class="info-val">${patientName}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Diabet turi & Yoshi</div>
        <div class="info-val">${profile.diabetesType === 'type1' ? '1-tur diabet' : '2-tur diabet'} | ${risk.patientOverview.age} yosh</div>
      </div>
    </div>

    <div class="grid-2" style="margin-top: 10px;">
      <div class="info-box">
        <div class="info-label">BMI (Tana massasi indeksi)</div>
        <div class="info-val">${risk.patientOverview.bmi} kg/m²</div>
      </div>
      <div class="info-box">
        <div class="info-label">O'rtacha qon bosimi</div>
        <div class="info-val">${risk.patientOverview.averageBloodPressure}</div>
      </div>
    </div>

    <!-- Glisemik ko'rsatkichlar -->
    <div class="section-title">Glisemik Nazorat Ko'rsatkichlari (ADA Standartlari)</div>
    <div class="grid-4">
      <div class="metric-card">
        <div class="metric-val">${metrics.meanGlucose}</div>
        <div class="metric-sub">O'rtacha qand (mmol/l)</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">${metrics.timeInRange.tir}%</div>
        <div class="metric-sub">TIR (Me'yordagi vaqt)</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">${metrics.estimatedA1C}%</div>
        <div class="metric-sub">Taxminiy HbA1c</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">${metrics.coefficientOfVariation}%</div>
        <div class="metric-sub">Glisemik tebranish (CV%)</div>
      </div>
    </div>

    <!-- Asoratlar xavfi -->
    <div class="section-title">Klinik Asoratlar Xavfini Baholash</div>
    
    <div class="risk-card">
      <div>
        <div style="font-weight: 700; font-size: 15px;">Diabetik Retinopatiya (Ko'z to'r pardasi)</div>
        <div style="font-size: 13px; color: #475569; margin-top: 3px;">${risk.complications.retinopathy.description}</div>
      </div>
      <div class="badge" style="background: ${getBadgeColor(risk.complications.retinopathy.level)};">${risk.complications.retinopathy.riskPercent}%</div>
    </div>

    <div class="risk-card">
      <div>
        <div style="font-weight: 700; font-size: 15px;">Diabetik Nefropatiya (Buyrak zararlanishi)</div>
        <div style="font-size: 13px; color: #475569; margin-top: 3px;">${risk.complications.nephropathy.description}</div>
      </div>
      <div class="badge" style="background: ${getBadgeColor(risk.complications.nephropathy.level)};">${risk.complications.nephropathy.riskPercent}%</div>
    </div>

    <div class="risk-card">
      <div>
        <div style="font-weight: 700; font-size: 15px;">Kardiovaskulyar asoratlar (ASCVD: Insult / Infarkt)</div>
        <div style="font-size: 13px; color: #475569; margin-top: 3px;">${risk.complications.cardiovascular.description}</div>
      </div>
      <div class="badge" style="background: ${getBadgeColor(risk.complications.cardiovascular.level)};">${risk.complications.cardiovascular.riskPercent}%</div>
    </div>

    <div class="risk-card">
      <div>
        <div style="font-weight: 700; font-size: 15px;">Diabetik Polineyropatiya & Tovon Yaralari</div>
        <div style="font-size: 13px; color: #475569; margin-top: 3px;">${risk.complications.neuropathy.description}</div>
      </div>
      <div class="badge" style="background: ${getBadgeColor(risk.complications.neuropathy.level)};">${risk.complications.neuropathy.riskPercent}%</div>
    </div>

    <!-- Tavsiyalar -->
    <div class="section-title">Avtomatik Klinik Tavsiyalar</div>
    <div class="rec-box">
      ${metrics.recommendations.map(r => `<div>• ${r}</div>`).join('')}
    </div>

    <div class="footer">
      <div>Mas'ul shifokor: <b>${doctorName}</b></div>
      <div>Imzo: ___________________</div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = {
  generateDoctorReportHTML
};

