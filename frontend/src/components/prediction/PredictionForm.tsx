import { useState } from 'react';
import type { PredictionInput } from '../../types/prediction';
import { EMPTY_PREDICTION_INPUT } from '../../types/prediction';

interface PredictionFormProps {
  onSubmit: (input: PredictionInput) => Promise<void>;
  loading:  boolean;
}

type FieldErrors = Partial<Record<keyof PredictionInput, string>>;

function validateField(name: keyof PredictionInput, value: number | boolean): string | null {
  if (typeof value === 'boolean') return null;
  const n = value as number;
  const rules: Partial<Record<keyof PredictionInput, [number, number, string]>> = {
    age:          [20,  80,  'Age must be between 20 and 80.'],
    cigs_per_day: [0,   60,  'Cigarettes per day must be 0–60.'],
    tot_chol:     [100, 600, 'Total cholesterol must be 100–600 mg/dL.'],
    sys_bp:       [80,  250, 'Systolic BP must be 80–250 mmHg.'],
    dia_bp:       [40,  160, 'Diastolic BP must be 40–160 mmHg.'],
    bmi:          [10,  60,  'BMI must be 10–60.'],
    heart_rate:   [40,  150, 'Heart rate must be 40–150 bpm.'],
    glucose:      [40,  500, 'Glucose must be 40–500 mg/dL.'],
  };
  const rule = rules[name];
  if (!rule) return null;
  const [min, max, msg] = rule;
  if (n === 0 && name !== 'cigs_per_day') return `${msg.split(' must')[0]} is required.`;
  if (n < min || n > max) return msg;
  return null;
}

function validateAll(form: PredictionInput): FieldErrors {
  const errors: FieldErrors = {};
  (Object.keys(form) as (keyof PredictionInput)[]).forEach((key) => {
    const err = validateField(key, form[key] as number | boolean);
    if (err) errors[key] = err;
  });
  return errors;
}

// ── Reusable field components ──────────────────────────────────────────────────

function NumField({
  id, label, placeholder, value, min, max, step, error, onChange, onBlur,
}: {
  id: string; label: string; placeholder: string;
  value: number | string; min?: number; max?: number; step?: number;
  error?: string; onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-brand-muted">{label}</label>
      <input
        id={id} type="number"
        min={min} max={max} step={step}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`field-input ${error ? 'border-red-400' : ''}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({
  id, label, value, options, onChange,
}: {
  id: string; label: string; value: string | number;
  options: { label: string; value: string | number }[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-brand-muted">{label}</label>
      <select id={id} value={value} onChange={onChange} className="field-select">
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

const YES_NO = [{ label: 'No', value: '0' }, { label: 'Yes', value: '1' }];

// ── Main form ──────────────────────────────────────────────────────────────────

export default function PredictionForm({ onSubmit, loading }: PredictionFormProps) {
  const [form,   setForm]   = useState<PredictionInput>(EMPTY_PREDICTION_INPUT);
  const [errors, setErrors] = useState<FieldErrors>({});

  const setNum = (field: keyof PredictionInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = parseFloat(e.target.value) || 0;
      setForm((p) => ({ ...p, [field]: val }));
      setErrors((p) => ({ ...p, [field]: validateField(field, val) ?? undefined }));
    };

  const setBool = (field: keyof PredictionInput) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value === '1' }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAll(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="card p-6 mb-4">
        <h3 className="text-sm font-semibold text-brand-text mb-4">· Patient Details</h3>

        <div className="grid grid-cols-2 gap-4">

          {/* Age */}
          <NumField
            id="age" label="Age (years)" placeholder="55"
            value={form.age || ''} min={20} max={80}
            error={errors.age}
            onChange={setNum('age')}
            onBlur={() => setErrors((p) => ({ ...p, age: validateField('age', form.age) ?? undefined }))}
          />

          {/* Sex */}
          <SelectField
            id="sex" label="Sex"
            value={form.sex}
            options={[{ label: 'Male', value: 1 }, { label: 'Female', value: 0 }]}
            onChange={setNum('sex')}
          />

          {/* Systolic BP */}
          <NumField
            id="sys_bp" label="Systolic BP (mmHg)" placeholder="120"
            value={form.sys_bp || ''} min={80} max={250}
            error={errors.sys_bp}
            onChange={setNum('sys_bp')}
            onBlur={() => setErrors((p) => ({ ...p, sys_bp: validateField('sys_bp', form.sys_bp) ?? undefined }))}
          />

          {/* Diastolic BP */}
          <NumField
            id="dia_bp" label="Diastolic BP (mmHg)" placeholder="80"
            value={form.dia_bp || ''} min={40} max={160}
            error={errors.dia_bp}
            onChange={setNum('dia_bp')}
            onBlur={() => setErrors((p) => ({ ...p, dia_bp: validateField('dia_bp', form.dia_bp) ?? undefined }))}
          />

          {/* Total Cholesterol */}
          <NumField
            id="tot_chol" label="Total Cholesterol (mg/dL)" placeholder="200"
            value={form.tot_chol || ''} min={100} max={600}
            error={errors.tot_chol}
            onChange={setNum('tot_chol')}
            onBlur={() => setErrors((p) => ({ ...p, tot_chol: validateField('tot_chol', form.tot_chol) ?? undefined }))}
          />

          {/* Glucose */}
          <NumField
            id="glucose" label="Glucose (mg/dL)" placeholder="85"
            value={form.glucose || ''} min={40} max={500}
            error={errors.glucose}
            onChange={setNum('glucose')}
            onBlur={() => setErrors((p) => ({ ...p, glucose: validateField('glucose', form.glucose) ?? undefined }))}
          />

          {/* BMI */}
          <NumField
            id="bmi" label="BMI (kg/m²)" placeholder="25"
            value={form.bmi || ''} min={10} max={60} step={0.1}
            error={errors.bmi}
            onChange={setNum('bmi')}
            onBlur={() => setErrors((p) => ({ ...p, bmi: validateField('bmi', form.bmi) ?? undefined }))}
          />

          {/* Heart Rate */}
          <NumField
            id="heart_rate" label="Heart Rate (bpm)" placeholder="72"
            value={form.heart_rate || ''} min={40} max={150}
            error={errors.heart_rate}
            onChange={setNum('heart_rate')}
            onBlur={() => setErrors((p) => ({ ...p, heart_rate: validateField('heart_rate', form.heart_rate) ?? undefined }))}
          />

          {/* Cigarettes per day */}
          <NumField
            id="cigs_per_day" label="Cigarettes per Day (0 if non-smoker)" placeholder="0"
            value={form.cigs_per_day === 0 ? '0' : form.cigs_per_day || ''}
            min={0} max={60}
            error={errors.cigs_per_day}
            onChange={setNum('cigs_per_day')}
          />

          {/* Diabetes */}
          <SelectField
            id="diabetes" label="Diabetes"
            value={form.diabetes ? '1' : '0'}
            options={YES_NO}
            onChange={setBool('diabetes')}
          />

          {/* BP Medication */}
          <SelectField
            id="bp_meds" label="On BP Medication"
            value={form.bp_meds ? '1' : '0'}
            options={YES_NO}
            onChange={setBool('bp_meds')}
          />

          {/* Prevalent Hypertension */}
          <SelectField
            id="prevalent_hyp" label="Prevalent Hypertension"
            value={form.prevalent_hyp ? '1' : '0'}
            options={YES_NO}
            onChange={setBool('prevalent_hyp')}
          />

          {/* Prevalent Stroke */}
          <SelectField
            id="prevalent_stroke" label="History of Stroke"
            value={form.prevalent_stroke ? '1' : '0'}
            options={YES_NO}
            onChange={setBool('prevalent_stroke')}
          />

        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Running assessment…' : 'Get Prediction'}
      </button>

      <p className="text-xs text-brand-muted text-center mt-3">
        ⚠️ This tool is for research purposes only and not a medical diagnosis.
      </p>
    </form>
  );
}
