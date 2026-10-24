# Model Card — CardioXAI Logistic Regression

> **Research prototype only.** This model is not validated for clinical use and
> does not constitute a medical device or diagnostic tool.

---

## Model Details

| Field | Value |
|-------|-------|
| **Model type** | Logistic Regression (sklearn `Pipeline`: SimpleImputer → StandardScaler → LogisticRegression) |
| **Version** | 1.0.0 |
| **Framework** | scikit-learn 1.6.1 |
| **Task** | Binary classification — 10-year coronary heart disease (CHD) risk |
| **Output** | Probability ∈ [0, 1] · Label: `Low Risk` / `Elevated Risk` |
| **Classification threshold** | 0.1684 (selected via out-of-fold F1 optimisation, **not** a clinical cutoff) |
| **Developed by** | CardioXAI academic research project |
| **Intended use** | Educational and research exploration of cardiovascular risk factors |

---

## Training Dataset

| Field | Value |
|-------|-------|
| **Dataset** | Framingham Heart Study (longitudinal community-based cohort) |
| **Study population** | Framingham, Massachusetts, USA |
| **Target variable** | 10-year incident coronary heart disease (`TenYearCHD`: 0 = no CHD, 1 = CHD) |
| **Class imbalance** | ~15% positive class (CHD) / ~85% negative class (no CHD) |
| **Features used** | 13 (see below) |

---

## Input Features

| Feature (training name) | Input field | Type | Range | Description |
|------------------------|-------------|------|-------|-------------|
| `age` | `age` | numeric | 20–80 | Age in years |
| `male` | `sex` | binary | 0/1 | Biological sex (1 = Male) |
| `cigsPerDay` | `cigs_per_day` | numeric | 0–60 | Cigarettes smoked per day |
| `BPMeds` | `bp_meds` | binary | 0/1 | On blood pressure medication |
| `prevalentStroke` | `prevalent_stroke` | binary | 0/1 | History of stroke |
| `prevalentHyp` | `prevalent_hyp` | binary | 0/1 | Prevalent hypertension |
| `diabetes` | `diabetes` | binary | 0/1 | Diabetes diagnosis |
| `totChol` | `tot_chol` | numeric | 100–600 | Total cholesterol (mg/dL) |
| `sysBP` | `sys_bp` | numeric | 80–250 | Systolic blood pressure (mmHg) |
| `diaBP` | `dia_bp` | numeric | 40–160 | Diastolic blood pressure (mmHg) |
| `BMI` | `bmi` | numeric | 10–60 | Body Mass Index (kg/m²) |
| `heartRate` | `heart_rate` | numeric | 40–150 | Resting heart rate (bpm) |
| `glucose` | `glucose` | numeric | 40–500 | Fasting glucose (mg/dL) |

---

## Evaluation Metrics (Reported — Research Use Only)

Evaluation was performed using stratified k-fold cross-validation (OOF = Out-of-Fold) and a held-out test split.

| Metric | OOF | Held-out |
|--------|-----|---------|
| ROC-AUC | 0.7300 | 0.6993 |
| PR-AUC | 0.3503 | — |
| Brier Score | 0.1159 | — |
| Sensitivity (Recall) | — | 56.6% |
| Specificity | — | 73.3% |
| F1 Score (at threshold 0.1684) | — | — |

> These metrics describe population-level model behaviour on historical data.
> They do **not** predict individual outcomes and should not be interpreted as
> clinical accuracy.

---

## Explainability

### SHAP
Shapley values are computed analytically for `LogisticRegression`:

```
φⱼ = coef_j × (x_j_scaled)
```

This is exact for linear models. Values are reported in log-odds space.
Positive values increase predicted risk; negative values decrease it.

### LIME
Local Interpretable Model-agnostic Explanations are generated per prediction
using `LimeTabularExplainer` with 500 perturbation samples. LIME approximates
the model locally with a linear surrogate and reports feature weights and
condition strings (e.g. `sysBP > 130.00`).

**Both methods describe model behaviour — not medical causation.**

---

## Limitations

1. **Population bias**: The Framingham cohort was predominantly white,
   middle-class Americans in the mid-20th century. Results may not generalise
   to other populations.

2. **Not clinically validated**: No prospective clinical validation has been
   performed. The model should not be used to make or inform medical decisions.

3. **Threshold is research-derived**: The 0.1684 threshold was optimised for
   F1 score on the training distribution, not for clinical sensitivity/specificity
   targets.

4. **Missing features**: Several established cardiovascular risk factors
   (family history, LDL/HDL cholesterol, exercise level) are not included
   because they were not present in the Framingham dataset version used.

5. **Linear model**: Logistic Regression cannot capture non-linear interactions
   between features. More complex models (e.g. gradient boosting) may better
   capture risk factor interactions.

---

## Ethical Considerations

- This tool is built for **academic research and education only**.
- It must not be deployed in clinical settings without regulatory approval.
- Users must be clearly informed that results are statistical estimates, not diagnoses.
- The disclaimer "Research use only — not a medical diagnosis" is displayed on
  every prediction result page and in the downloaded PDF report.
