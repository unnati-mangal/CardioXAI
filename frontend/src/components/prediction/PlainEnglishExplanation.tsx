/**
 * Plain-English Explanation
 *
 * Converts SHAP values + patient inputs into human-readable sentences —
 * "factors pushing your risk up", "factors keeping it down", and
 * personalised actionable recommendations based on the modifiable risk factors.
 */
import { TrendingUp, TrendingDown, Lightbulb, AlertCircle } from 'lucide-react';
import type { ShapEntry, PredictionInput, PredictionResponse } from '../../types/prediction';

interface Props {
  result: PredictionResponse;
  input:  PredictionInput;
}

// ── Map training feature names → friendly plain-English descriptions ──────────

function describeShapFactor(entry: ShapEntry, input: PredictionInput): string {
  const f = entry.feature;
  const v = entry.shap_value;
  if (Math.abs(v) < 0.005) return ''; // ignore negligible contributors

  switch (f) {
    case 'age':
      return `Your age of ${input.age} years`;
    case 'male':
      return `Your biological sex (${input.sex === 1 ? 'Male' : 'Female'})`;
    case 'sysBP':
      return `Your systolic blood pressure of ${input.sys_bp} mmHg`;
    case 'diaBP':
      return `Your diastolic blood pressure of ${input.dia_bp} mmHg`;
    case 'totChol':
      return `Your total cholesterol of ${input.tot_chol} mg/dL`;
    case 'BMI':
      return `Your BMI of ${input.bmi.toFixed(1)}`;
    case 'heartRate':
      return `Your heart rate of ${input.heart_rate} bpm`;
    case 'glucose':
      return `Your glucose level of ${input.glucose} mg/dL`;
    case 'cigsPerDay':
      return input.cigs_per_day > 0
        ? `Smoking ${input.cigs_per_day} cigarettes per day`
        : `Not smoking`;
    case 'BPMeds':
      return input.bp_meds
        ? 'Being on blood pressure medication'
        : 'Not being on blood pressure medication';
    case 'prevalentHyp':
      return input.prevalent_hyp
        ? 'Having prevalent hypertension'
        : 'Not having hypertension';
    case 'prevalentStroke':
      return input.prevalent_stroke
        ? 'History of stroke'
        : 'No history of stroke';
    case 'diabetes':
      return input.diabetes ? 'Having diabetes' : 'Not having diabetes';
    default:
      return entry.label;
  }
}

// ── Generate recommendations based on which factors are pushing risk UP ───────

interface Recommendation {
  title:   string;
  detail:  string;
  modifiable: boolean;
}

function buildRecommendations(
  riskFactors: ShapEntry[],
  input: PredictionInput,
  pct: number,
): Recommendation[] {
  const recs: Recommendation[] = [];
  const features = new Set(riskFactors.map((e) => e.feature));

  if (features.has('sysBP') && input.sys_bp > 120) {
    recs.push({
      title:   'Manage your blood pressure',
      detail:  `Your systolic BP is ${input.sys_bp} mmHg. A healthy target is below 120 mmHg. Regular exercise, reducing salt intake, and stress management can help.`,
      modifiable: true,
    });
  }
  if (features.has('totChol') && input.tot_chol > 200) {
    recs.push({
      title:   'Work on lowering your cholesterol',
      detail:  `Your total cholesterol is ${input.tot_chol} mg/dL. Consider a diet low in saturated fats, regular aerobic exercise, and discuss medication options with your doctor if needed.`,
      modifiable: true,
    });
  }
  if (features.has('BMI') && input.bmi > 25) {
    recs.push({
      title:   'Work towards a healthier BMI',
      detail:  `Your BMI is ${input.bmi.toFixed(1)}. Even a 5–10% reduction in body weight can significantly lower your cardiovascular risk.`,
      modifiable: true,
    });
  }
  if (features.has('cigsPerDay') && input.cigs_per_day > 0) {
    recs.push({
      title:   'Quit smoking',
      detail:  `You smoke ${input.cigs_per_day} cigarettes per day. Quitting smoking is one of the most impactful steps you can take — it reduces heart disease risk within weeks.`,
      modifiable: true,
    });
  }
  if (features.has('glucose') && input.glucose > 100) {
    recs.push({
      title:   'Monitor your blood sugar',
      detail:  `Your glucose is ${input.glucose} mg/dL. Keeping blood sugar in the normal range (70–99 mg/dL fasting) is important for heart health.`,
      modifiable: true,
    });
  }
  if (features.has('prevalentHyp') && input.prevalent_hyp) {
    recs.push({
      title:   'Keep your hypertension under control',
      detail:  'With a history of hypertension, consistent blood pressure management through medication, diet, and lifestyle is essential.',
      modifiable: true,
    });
  }
  if (features.has('diabetes') && input.diabetes) {
    recs.push({
      title:   'Manage your diabetes actively',
      detail:  'Diabetes significantly increases cardiovascular risk. Work with your doctor to keep HbA1c and blood sugar within target ranges.',
      modifiable: true,
    });
  }
  if (features.has('age')) {
    recs.push({
      title:   'Maintain a heart-healthy lifestyle as you age',
      detail:  'Age is not modifiable, but regular check-ups, staying active, and eating well can significantly offset age-related cardiovascular risk.',
      modifiable: false,
    });
  }

  // Always add this
  recs.push({
    title:   'Schedule a check-up with your doctor',
    detail:  `With a ${pct}% estimated risk, it's worth discussing these results with a healthcare professional who can evaluate your full medical history.`,
    modifiable: true,
  });

  return recs;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlainEnglishExplanation({ result, input }: Props) {
  if (!result.risk_score || result.shap_values.length === 0) return null;

  const pct = Math.round(result.risk_score * 100);

  // Split SHAP values into factors pushing risk UP vs DOWN
  // Filter out negligible ones (|shap| < 0.005)
  const increasing = result.shap_values
    .filter((e) => e.shap_value > 0.005)
    .sort((a, b) => b.shap_value - a.shap_value);

  const decreasing = result.shap_values
    .filter((e) => e.shap_value < -0.005)
    .sort((a, b) => a.shap_value - b.shap_value);

  const recommendations = buildRecommendations(increasing, input, pct);

  const riskColor =
    pct <= 15 ? 'text-brand-green' :
    pct <= 30 ? 'text-amber-600'   : 'text-red-600';

  return (
    <div className="card p-6 flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="font-bold text-brand-text text-base mb-1">
          Understanding Your Results in Plain English
        </h2>
        <p className="text-sm text-brand-muted">
          The model predicts a{' '}
          <span className={`font-bold ${riskColor}`}>{pct}% probability</span>{' '}
          of heart disease over the next 10 years. Here's what drove that prediction — explained without the technical jargon.
        </p>
      </div>

      {/* Factors increasing risk */}
      {increasing.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-red-500" />
            </div>
            <h3 className="font-semibold text-brand-text text-sm">
              Factors increasing your risk
            </h3>
          </div>
          <ul className="flex flex-col gap-2">
            {increasing.map((entry) => {
              const desc = describeShapFactor(entry, input);
              if (!desc) return null;
              return (
                <li key={entry.feature} className="flex items-start gap-2.5 text-sm">
                  <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">↑</span>
                  <span className="text-brand-muted">
                    <span className="font-medium text-brand-text">{desc}</span>
                    {' '}is pushing your risk higher.
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-brand-border" />

      {/* Factors decreasing risk */}
      {decreasing.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand-green-light flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-3.5 h-3.5 text-brand-green" />
            </div>
            <h3 className="font-semibold text-brand-text text-sm">
              Factors working in your favour
            </h3>
          </div>
          <ul className="flex flex-col gap-2">
            {decreasing.map((entry) => {
              const desc = describeShapFactor(entry, input);
              if (!desc) return null;
              return (
                <li key={entry.feature} className="flex items-start gap-2.5 text-sm">
                  <span className="text-brand-green font-bold mt-0.5 flex-shrink-0">↓</span>
                  <span className="text-brand-muted">
                    <span className="font-medium text-brand-text">{desc}</span>
                    {' '}is helping keep your risk lower.
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-brand-border" />

      {/* Actionable recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h3 className="font-semibold text-brand-text text-sm">
            What you can do — Actionable Recommendations
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                rec.modifiable ? 'bg-brand-green-light' : 'bg-neutral-100'
              }`}>
                <span className={`text-xs font-bold ${
                  rec.modifiable ? 'text-brand-green' : 'text-brand-muted'
                }`}>{i + 1}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-text">{rec.title}</p>
                <p className="text-xs text-brand-muted leading-relaxed mt-0.5">{rec.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Research use only.</strong> This explanation is based on a statistical model trained on the
          Framingham Heart Study dataset. It describes model behaviour — not medical causation.
          These results do <strong>not</strong> constitute a diagnosis. Always consult a qualified
          healthcare professional before making any health decisions.
        </p>
      </div>

    </div>
  );
}
