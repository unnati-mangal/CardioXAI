import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import type { PredictionInput } from '../../types/prediction';
import { EMPTY_PREDICTION_INPUT } from '../../types/prediction';

interface PredictionFormProps {
  onSubmit:  (input: PredictionInput) => Promise<void>;
  loading:   boolean;
}

type FieldErrors = Partial<Record<keyof PredictionInput, string>>;

// ── Validation helpers ────────────────────────────────────────────────────────

function validateField(name: keyof PredictionInput, value: number | boolean): string | null {
  if (typeof value === 'boolean') return null; // booleans are always valid checkboxes

  const n = value as number;

  const rules: Partial<Record<keyof PredictionInput, [number, number, string]>> = {
    age:          [20,  80,  'Age must be between 20 and 80.'],
    cigs_per_day: [0,   60,  'Cigarettes per day must be between 0 and 60.'],
    tot_chol:     [100, 600, 'Total cholesterol must be between 100 and 600 mg/dL.'],
    sys_bp:       [80,  250, 'Systolic BP must be between 80 and 250 mmHg.'],
    dia_bp:       [40,  160, 'Diastolic BP must be between 40 and 160 mmHg.'],
    bmi:          [10,  60,  'BMI must be between 10 and 60.'],
    heart_rate:   [40,  150, 'Heart rate must be between 40 and 150 bpm.'],
    glucose:      [40,  500, 'Glucose must be between 40 and 500 mg/dL.'],
  };

  const rule = rules[name];
  if (!rule) return null;
  const [min, max, msg] = rule;
  if (n === 0) return `${msg.split(' must')[0]} is required.`;
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

// ── Section wrapper ───────────────────────────────────────────────────────────

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

// ── Checkbox field ────────────────────────────────────────────────────────────

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id:       string;
  label:    string;
  checked:  boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 cursor-pointer select-none group"
    >
      <div className={[
        'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
        checked
          ? 'bg-forest-green border-forest-green'
          : 'border-neutral-300 group-hover:border-sage-green',
      ].join(' ')}>
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-sm text-neutral-700">{label}</span>
    </label>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function PredictionForm({ onSubmit, loading }: PredictionFormProps) {
  const [form,   setForm]   = useState<PredictionInput>(EMPTY_PREDICTION_INPUT);
  const [errors, setErrors] = useState<FieldErrors>({});

  const setNum = (field: keyof PredictionInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setForm((prev) => ({ ...prev, [field]: val }));
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err ?? undefined }));
  };

  const setBool = (field: keyof PredictionInput) => (val: boolean) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAll(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

      {/* Demographics */}
      <FormSection title="Demographics">
        <Input
          id="age"
          label="Age (years)"
          type="number"
          min={20} max={80}
          placeholder="e.g. 45"
          value={form.age || ''}
          onChange={setNum('age')}
          onBlur={() => setErrors((p) => ({ ...p, age: validateField('age', form.age) ?? undefined }))}
          error={errors.age}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="sex" className="text-sm font-medium text-neutral-700">
            Biological Sex
          </label>
          <select
            id="sex"
            value={form.sex}
            onChange={setNum('sex')}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-sage-green/50 focus:border-sage-green transition-colors"
          >
            <option value={0}>Female</option>
            <option value={1}>Male</option>
          </select>
        </div>
      </FormSection>

      {/* Vitals */}
      <FormSection title="Vitals">
        <Input
          id="sys_bp"
          label="Systolic Blood Pressure (mmHg)"
          type="number"
          min={80} max={250}
          placeholder="e.g. 120"
          value={form.sys_bp || ''}
          onChange={setNum('sys_bp')}
          onBlur={() => setErrors((p) => ({ ...p, sys_bp: validateField('sys_bp', form.sys_bp) ?? undefined }))}
          error={errors.sys_bp}
        />
        <Input
          id="dia_bp"
          label="Diastolic Blood Pressure (mmHg)"
          type="number"
          min={40} max={160}
          placeholder="e.g. 80"
          value={form.dia_bp || ''}
          onChange={setNum('dia_bp')}
          onBlur={() => setErrors((p) => ({ ...p, dia_bp: validateField('dia_bp', form.dia_bp) ?? undefined }))}
          error={errors.dia_bp}
        />
        <Input
          id="tot_chol"
          label="Total Cholesterol (mg/dL)"
          type="number"
          min={100} max={600}
          placeholder="e.g. 200"
          value={form.tot_chol || ''}
          onChange={setNum('tot_chol')}
          onBlur={() => setErrors((p) => ({ ...p, tot_chol: validateField('tot_chol', form.tot_chol) ?? undefined }))}
          error={errors.tot_chol}
        />
        <Input
          id="bmi"
          label="Body Mass Index (BMI)"
          type="number"
          min={10} max={60}
          step={0.1}
          placeholder="e.g. 25.4"
          value={form.bmi || ''}
          onChange={setNum('bmi')}
          onBlur={() => setErrors((p) => ({ ...p, bmi: validateField('bmi', form.bmi) ?? undefined }))}
          error={errors.bmi}
        />
        <Input
          id="heart_rate"
          label="Heart Rate (bpm)"
          type="number"
          min={40} max={150}
          placeholder="e.g. 72"
          value={form.heart_rate || ''}
          onChange={setNum('heart_rate')}
          onBlur={() => setErrors((p) => ({ ...p, heart_rate: validateField('heart_rate', form.heart_rate) ?? undefined }))}
          error={errors.heart_rate}
        />
        <Input
          id="glucose"
          label="Glucose (mg/dL)"
          type="number"
          min={40} max={500}
          placeholder="e.g. 85"
          value={form.glucose || ''}
          onChange={setNum('glucose')}
          onBlur={() => setErrors((p) => ({ ...p, glucose: validateField('glucose', form.glucose) ?? undefined }))}
          error={errors.glucose}
        />
      </FormSection>

      {/* Lifestyle */}
      <FormSection title="Lifestyle">
        <Input
          id="cigs_per_day"
          label="Cigarettes per Day"
          type="number"
          min={0} max={60}
          placeholder="0 if non-smoker"
          value={form.cigs_per_day === 0 ? '0' : form.cigs_per_day || ''}
          onChange={setNum('cigs_per_day')}
          onBlur={() => setErrors((p) => ({ ...p, cigs_per_day: validateField('cigs_per_day', form.cigs_per_day) ?? undefined }))}
          error={errors.cigs_per_day}
          helperText="Enter 0 if you do not smoke."
        />
      </FormSection>

      {/* Medical History */}
      <FormSection title="Medical History">
        <CheckboxField
          id="bp_meds"
          label="Currently on blood pressure medication"
          checked={form.bp_meds}
          onChange={setBool('bp_meds')}
        />
        <CheckboxField
          id="prevalent_stroke"
          label="History of stroke"
          checked={form.prevalent_stroke}
          onChange={setBool('prevalent_stroke')}
        />
        <CheckboxField
          id="prevalent_hyp"
          label="Prevalent hypertension"
          checked={form.prevalent_hyp}
          onChange={setBool('prevalent_hyp')}
        />
        <CheckboxField
          id="diabetes"
          label="Diabetes diagnosis"
          checked={form.diabetes}
          onChange={setBool('diabetes')}
        />
      </FormSection>

      <Button type="submit" variant="primary" loading={loading} fullWidth>
        Run Risk Assessment
      </Button>
    </form>
  );
}
