import type { PredictionResponse, PredictionInput } from '../types/prediction';

/** Download a PDF report by printing a generated HTML page in a new window. */
export function downloadReport(
  result: PredictionResponse,
  input: PredictionInput,
): void {
  const pct      = result.risk_score !== null ? Math.round(result.risk_score * 100) : null;
  const riskDesc =
    pct === null       ? '—'
    : pct <= 15        ? 'Low Risk'
    : pct <= 30        ? 'Moderate Risk'
    : 'High Risk';

  const riskColor =
    pct === null ? '#6B7D72'
    : pct <= 15  ? '#3D7A5A'
    : pct <= 30  ? '#D97706'
    : '#DC2626';

  const now    = new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });
  const sexStr = input.sex === 1 ? 'Male' : 'Female';

  // SHAP rows
  const shapRows = result.shap_values.slice(0, 8).map((s) => `
    <tr>
      <td>${s.label}</td>
      <td style="color:${s.shap_value >= 0 ? '#DC2626' : '#3D7A5A'};font-weight:600">
        ${s.shap_value >= 0 ? '+' : ''}${s.shap_value.toFixed(4)}
      </td>
      <td>${s.direction === 'positive' ? '↑ Increases risk' : '↓ Decreases risk'}</td>
    </tr>`).join('');

  // LIME rows
  const limeRows = result.lime_values.slice(0, 8).map((l) => `
    <tr>
      <td>${l.label}</td>
      <td style="color:${l.weight >= 0 ? '#DC2626' : '#3D7A5A'};font-weight:600">
        ${l.weight >= 0 ? '+' : ''}${l.weight.toFixed(4)}
      </td>
      <td style="font-size:11px;color:#6B7D72">${l.condition}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CardioXAI Report — ${now}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, "Segoe UI", Arial, sans-serif;
      font-size: 13px;
      color: #1C2B22;
      background: #fff;
      padding: 32px 40px;
      max-width: 760px;
      margin: 0 auto;
    }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
    .logo { width: 32px; height: 32px; background: #EAF2EC; border-radius: 8px;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .logo svg { width: 18px; height: 18px; }
    h1 { font-size: 20px; color: #3D7A5A; }
    .meta { font-size: 11px; color: #6B7D72; margin-bottom: 28px; }
    .risk-banner {
      background: #F7FAF7;
      border: 1.5px solid #DDE8DD;
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
    }
    .gauge-text { font-size: 36px; font-weight: 800; color: ${riskColor}; line-height: 1; }
    .risk-label {
      display: inline-block;
      background: ${pct !== null && pct > 30 ? '#FEF2F2' : pct !== null && pct > 15 ? '#FFFBEB' : '#EAF2EC'};
      color: ${riskColor};
      font-size: 12px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 6px;
    }
    .risk-desc { font-size: 12px; color: #4A6655; line-height: 1.6; max-width: 380px; }
    .section { margin-bottom: 24px; }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6B7D72;
      border-bottom: 1px solid #DDE8DD;
      padding-bottom: 5px;
      margin-bottom: 12px;
    }
    .inputs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px 16px;
    }
    .input-item { font-size: 12px; }
    .input-label { color: #6B7D72; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    .input-val   { font-weight: 600; color: #1C2B22; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; font-size: 10px; text-transform: uppercase;
         letter-spacing: 0.06em; color: #6B7D72; padding: 4px 8px; 
         border-bottom: 1px solid #DDE8DD; }
    td { padding: 6px 8px; border-bottom: 1px solid #F0F4F0; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .plain-english { margin-bottom: 24px; }
    .pe-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
    .pe-icon { flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%;
               display: flex; align-items: center; justify-content: center;
               font-size: 11px; font-weight: 700; line-height: 1; }
    .pe-icon-up   { background: #FEF2F2; color: #DC2626; }
    .pe-icon-down { background: #EAF2EC; color: #3D7A5A; }
    .pe-icon-rec  { background: #EAF2EC; color: #3D7A5A; }
    .pe-text { font-size: 12px; color: #4A6655; line-height: 1.5; }
    .pe-text strong { color: #1C2B22; }
    .pe-rec-title { font-size: 12px; font-weight: 700; color: #1C2B22; }
    .pe-rec-detail { font-size: 11px; color: #6B7D72; line-height: 1.5; }
    .disclaimer {
      margin-top: 28px;
      padding: 10px 14px;
      background: #FFF8F0;
      border-left: 3px solid #D97706;
      border-radius: 4px;
      font-size: 11px;
      color: #6B4C1A;
      line-height: 1.6;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 10px;
      color: #9AA89F;
      border-top: 1px solid #DDE8DD;
      padding-top: 12px;
    }
    @media print {
      body { padding: 16px 24px; }
      @page { margin: 1.2cm; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="#3D7A5A" stroke-width="2" stroke-linecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </div>
    <h1>CardioXAI Risk Report</h1>
  </div>
  <p class="meta">Generated: ${now}${result.model_version ? ` &nbsp;·&nbsp; Model v${result.model_version}` : ''}</p>

  <!-- Risk banner -->
  ${pct !== null ? `
  <div class="risk-banner">
    <div>
      <div class="gauge-text">${pct}%</div>
      <div style="font-size:11px;color:#6B7D72;margin-top:2px">10-year CHD risk</div>
    </div>
    <div>
      <div class="risk-label">${riskDesc}</div>
      <p class="risk-desc">
        Your predicted 10-year coronary heart disease risk is <strong>${pct}%</strong>.
        ${result.threshold ? `Classification threshold used: ${(result.threshold * 100).toFixed(1)}%.` : ''}
        This is a research estimate — not a clinical diagnosis.
      </p>
    </div>
  </div>` : '<p style="color:#6B7D72;margin-bottom:24px">Risk score not available.</p>'}

  <!-- Patient inputs -->
  <div class="section">
    <div class="section-title">Patient Input Values</div>
    <div class="inputs-grid">
      ${[
        ['Age',               `${input.age} years`],
        ['Sex',               sexStr],
        ['Systolic BP',       `${input.sys_bp} mmHg`],
        ['Diastolic BP',      `${input.dia_bp} mmHg`],
        ['Total Cholesterol', `${input.tot_chol} mg/dL`],
        ['Glucose',           `${input.glucose} mg/dL`],
        ['BMI',               input.bmi.toFixed(1)],
        ['Heart Rate',        `${input.heart_rate} bpm`],
        ['Cigarettes/day',    String(input.cigs_per_day)],
        ['Diabetes',          input.diabetes ? 'Yes' : 'No'],
        ['BP Medication',     input.bp_meds ? 'Yes' : 'No'],
        ['Hypertension',      input.prevalent_hyp ? 'Yes' : 'No'],
        ['History of Stroke', input.prevalent_stroke ? 'Yes' : 'No'],
      ].map(([label, val]) => `
        <div class="input-item">
          <div class="input-label">${label}</div>
          <div class="input-val">${val}</div>
        </div>`).join('')}
    </div>
  </div>

  <!-- SHAP -->
  ${shapRows ? `
  <div class="section">
    <div class="section-title">SHAP Feature Contributions (Top 8)</div>
    <table>
      <thead><tr><th>Feature</th><th>SHAP Value</th><th>Direction</th></tr></thead>
      <tbody>${shapRows}</tbody>
    </table>
  </div>` : ''}

  <!-- LIME -->
  ${limeRows ? `
  <div class="section">
    <div class="section-title">LIME Local Explanation (Top 8)</div>
    <table>
      <thead><tr><th>Feature</th><th>Weight</th><th>Condition</th></tr></thead>
      <tbody>${limeRows}</tbody>
    </table>
  </div>` : ''}

  <!-- Plain-English Explanation -->
  ${pct !== null && result.shap_values.length > 0 ? (() => {
    const increasing = result.shap_values.filter(e => e.shap_value > 0.005).sort((a, b) => b.shap_value - a.shap_value);
    const decreasing = result.shap_values.filter(e => e.shap_value < -0.005).sort((a, b) => a.shap_value - b.shap_value);

    const featureLabel = (f: string): string => {
      const map: Record<string, string> = {
        age: `Age (${input.age} years)`,
        male: `Biological sex (${input.sex === 1 ? 'Male' : 'Female'})`,
        sysBP: `Systolic BP (${input.sys_bp} mmHg)`,
        diaBP: `Diastolic BP (${input.dia_bp} mmHg)`,
        totChol: `Total cholesterol (${input.tot_chol} mg/dL)`,
        BMI: `BMI (${input.bmi.toFixed(1)})`,
        heartRate: `Heart rate (${input.heart_rate} bpm)`,
        glucose: `Glucose (${input.glucose} mg/dL)`,
        cigsPerDay: input.cigs_per_day > 0 ? `Smoking (${input.cigs_per_day} cigs/day)` : 'Not smoking',
        BPMeds: input.bp_meds ? 'Blood pressure medication' : 'No BP medication',
        prevalentHyp: input.prevalent_hyp ? 'Prevalent hypertension' : 'No hypertension',
        prevalentStroke: input.prevalent_stroke ? 'History of stroke' : 'No history of stroke',
        diabetes: input.diabetes ? 'Diabetes' : 'No diabetes',
      };
      return map[f] ?? f;
    };

    const upRows    = increasing.map(e => `<div class="pe-row"><div class="pe-icon pe-icon-up">↑</div><div class="pe-text"><strong>${featureLabel(e.feature)}</strong> is pushing your risk higher.</div></div>`).join('');
    const downRows  = decreasing.map(e => `<div class="pe-row"><div class="pe-icon pe-icon-down">↓</div><div class="pe-text"><strong>${featureLabel(e.feature)}</strong> is helping keep your risk lower.</div></div>`).join('');

    const recs: Array<[string, string]> = [];
    const feats = new Set(increasing.map(e => e.feature));
    if (feats.has('sysBP') && input.sys_bp > 120) recs.push(['Manage your blood pressure', `Your systolic BP is ${input.sys_bp} mmHg. Target: below 120 mmHg. Exercise, reduce salt, manage stress.`]);
    if (feats.has('totChol') && input.tot_chol > 200) recs.push(['Lower your cholesterol', `Total cholesterol ${input.tot_chol} mg/dL. Reduce saturated fat, increase aerobic activity.`]);
    if (feats.has('BMI') && input.bmi > 25) recs.push(['Work towards a healthier BMI', `BMI ${input.bmi.toFixed(1)}. Even 5–10% weight reduction meaningfully lowers cardiovascular risk.`]);
    if (feats.has('cigsPerDay') && input.cigs_per_day > 0) recs.push(['Quit smoking', `Smoking ${input.cigs_per_day} cigarettes per day. Quitting reduces heart disease risk within weeks.`]);
    if (feats.has('glucose') && input.glucose > 100) recs.push(['Monitor blood sugar', `Glucose ${input.glucose} mg/dL. Normal fasting range: 70–99 mg/dL.`]);
    if (feats.has('diabetes') && input.diabetes) recs.push(['Manage diabetes actively', 'Work with your doctor to keep HbA1c and blood sugar within target ranges.']);
    recs.push(['See your doctor', `With a ${pct}% estimated risk, discuss these results with a healthcare professional.`]);

    const recRows = recs.map(([title, detail], i) => `
      <div class="pe-row">
        <div class="pe-icon pe-icon-rec">${i + 1}</div>
        <div>
          <div class="pe-rec-title">${title}</div>
          <div class="pe-rec-detail">${detail}</div>
        </div>
      </div>`).join('');

    return `
  <div class="section plain-english">
    <div class="section-title">Plain-English Explanation</div>
    ${upRows ? `<div style="margin-bottom:12px"><strong style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#DC2626">Factors increasing risk</strong><div style="margin-top:8px">${upRows}</div></div>` : ''}
    ${downRows ? `<div style="margin-bottom:12px"><strong style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#3D7A5A">Factors working in your favour</strong><div style="margin-top:8px">${downRows}</div></div>` : ''}
    <strong style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#D97706">Recommendations</strong>
    <div style="margin-top:8px">${recRows}</div>
  </div>`;
  })() : ''}

  <!-- Disclaimer -->
  <div class="disclaimer">
    ⚠️ <strong>Research prototype only.</strong> CardioXAI is built on the Framingham Heart Study dataset 
    for academic research purposes. It does <strong>not</strong> provide medical advice and is 
    <strong>not</strong> a substitute for professional clinical assessment. Always consult a qualified 
    healthcare professional for any medical decisions.
  </div>

  <div class="footer">CardioXAI &nbsp;·&nbsp; Academic Research Project &nbsp;·&nbsp; Not validated for clinical use</div>

</body>
</html>`;

  const win = window.open('', '_blank', 'width=820,height=900');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  // Small delay so styles render before the print dialog opens
  setTimeout(() => { win.print(); }, 400);
}
