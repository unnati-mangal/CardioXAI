# Research Methodology

> **Research prototype only.** CardioXAI is an academic project and not a
> validated clinical tool.

---

## Overview

CardioXAI estimates an individual's 10-year coronary heart disease (CHD) risk
using a Logistic Regression model trained on the Framingham Heart Study dataset.
Explainability is provided through SHAP (SHapley Additive exPlanations) and
LIME (Local Interpretable Model-agnostic Explanations).

---

## Dataset

### Framingham Heart Study

The Framingham Heart Study is a landmark longitudinal cohort study initiated in
1948 in Framingham, Massachusetts. The version used in this project is the
publicly available Kaggle subset (`framingham.csv`) containing approximately
4,240 patient records with 16 features.

**Key characteristics:**

| Property | Value |
|----------|-------|
| Source | Framingham Heart Study (Kaggle subset) |
| Records | ~4,240 |
| Features | 16 original, 13 used after preprocessing |
| Target variable | `TenYearCHD` — binary (0 = no event, 1 = CHD within 10 years) |
| Class distribution | ~85% negative (no CHD), ~15% positive (CHD) |
| Missing values | Present in several columns (handled by median imputation) |

### Preprocessing

1. **Feature selection** — 3 features were dropped based on high missingness or
   redundancy with other features
2. **Missing value imputation** — `SimpleImputer(strategy="median")` applied
   within the sklearn pipeline (fit on training data only, no data leakage)
3. **Feature scaling** — `StandardScaler` applied after imputation
4. **Train/test split** — stratified 80/20 split to preserve class distribution

---

## Model Selection

`LogisticRegression` was selected for the following reasons:

1. **Interpretability** — coefficients directly represent log-odds contributions,
   making analytical SHAP computation exact
2. **SHAP compatibility** — analytical SHAP computation avoids approximation
   error introduced by sampling-based methods
3. **Established baseline** — Logistic Regression is a standard model for
   cardiovascular risk scoring (e.g. Framingham Risk Score itself)
4. **Data scale** — the dataset size (~4,200 records) favours simpler models
   that do not overfit

---

## Evaluation

### Cross-validation

Stratified k-fold cross-validation was used to produce out-of-fold (OOF)
probability estimates, which were used for:

- ROC-AUC and PR-AUC measurement
- Threshold calibration (F1-optimal threshold)
- Brier Score (probability calibration)

### Threshold selection

The standard 0.5 threshold is inappropriate for imbalanced datasets. The
classification threshold was selected as the value that maximises out-of-fold
F1 score. The selected threshold is **0.1684**.

> ⚠️ This threshold was optimised for the Framingham training distribution.
> It is **not** a clinically recommended cutoff for screening or diagnosis.

### Metrics

| Metric | OOF | Held-out |
|--------|-----|---------|
| ROC-AUC | 0.7300 | 0.6993 |
| PR-AUC | 0.3503 | — |
| Brier Score | 0.1159 | — |
| Sensitivity | — | 56.6% |
| Specificity | — | 73.3% |

---

## Explainability Methods

### SHAP (SHapley Additive exPlanations)

SHAP values quantify each feature's contribution to the difference between the
model's prediction and the average prediction. For Logistic Regression, they
are computed analytically:

```
φⱼ = coef_j × x_j_scaled
```

where `x_j_scaled` is the standardised feature value. This is exact — no
Monte Carlo sampling required.

**Interpretation**: A positive SHAP value means the feature increases the
predicted risk above the baseline. A negative value means it decreases risk.

### LIME (Local Interpretable Model-agnostic Explanations)

LIME fits a local linear approximation to the model in the neighbourhood of a
single prediction. For each prediction:

1. Generate 500 perturbed samples around the input
2. Weight samples by proximity to the original input
3. Fit a Ridge regression on the perturbed samples
4. Report the Ridge coefficients as feature importances

**Interpretation**: LIME reports condition strings (e.g. `sysBP > 130.00`)
and weights. A positive weight means the condition increases predicted risk.

### Why both?

SHAP and LIME complement each other:

- **SHAP** provides mathematically rigorous, globally consistent attributions
- **LIME** provides locally faithful explanations that are model-agnostic and
  condition-based (more readable for non-technical users)

---

## Limitations and Ethical Considerations

1. **Population generalisability** — The Framingham cohort is not representative
   of all populations. Risk estimates may be systematically off for groups not
   well-represented in the training data.

2. **Temporal drift** — Medical norms and population health have changed since
   the Framingham study was conducted. The model's coefficients reflect
   historical relationships.

3. **Confounding** — Observational data cannot establish causal relationships.
   SHAP/LIME values describe model behaviour, not real-world causation.

4. **No clinical validation** — No prospective clinical study has been conducted
   to validate this model's predictions in a real healthcare setting.

5. **Research only** — This system is built as an educational tool to explore
   XAI techniques in healthcare. It must not be used to inform medical decisions.
