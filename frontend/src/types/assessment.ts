export interface Assessment {
  id:                   number;
  user_id:              string;
  created_at:           string;

  // 13 Framingham input fields
  age:                  number;
  sex:                  number;          // 0 = Female, 1 = Male
  cigs_per_day:         number;
  bp_meds:              boolean;
  prevalent_stroke:     boolean;
  prevalent_hyp:        boolean;
  diabetes:             boolean;
  tot_chol:             number;
  sys_bp:               number;
  dia_bp:               number;
  bmi:                  number;
  heart_rate:           number;
  glucose:              number;

  // Result fields — null until ML phase
  prediction_label:       string | null;
  prediction_probability: number | null;
  is_stub:                boolean;
}
