# Model Evaluation

> **Research prototype only.** These metrics describe model behaviour on
> historical data and do not reflect clinical diagnostic accuracy.

---

## Evaluation Approach

The model was evaluated using two complementary approaches:

1. **Out-of-fold (OOF) evaluation** — stratified k-fold cross-validation on
   the training set to produce unbiased probability estimates
2. **Held-out test set** — a stratified 20% split withheld before training

---

## Dataset Split

| Split | Records (approx.) | CHD positive |
|-------|------------------|--------------|
| Training (80%) | ~3,392 | ~15% |
| Test (20%) | ~848 | ~15% |

Stratification ensures the positive class ratio is preserved in both splits.

---

## Performance Metrics

### Out-of-fold (OOF) metrics

| Metric | Value | Interpretation |
|--------|-------|----------------|
| **ROC-AUC** | **0.7300** | Probability the model ranks a CHD case higher than a non-CHD case |
| **PR-AUC** | **0.3503** | Area under the Precision-Recall curve (relevant for imbalanced data) |
| **Brier Score** | **0.1159** | Mean squared probability calibration error (lower = better) |

### Held-out test metrics (at threshold 0.1684)

| Metric | Value | Interpretation |
|--------|-------|----------------|
| **ROC-AUC** | **0.6993** | Discrimination ability on unseen data |
| **Sensitivity** | **56.6%** | % of true CHD cases correctly identified |
| **Specificity** | **73.3%** | % of true non-CHD cases correctly identified |

---

## Classification Threshold

The standard 0.5 threshold is inappropriate for class-imbalanced data. The
threshold was chosen by maximising out-of-fold F1 score:

| Threshold | Basis |
|-----------|-------|
| **0.1684** | OOF F1-optimal (not a clinically validated cutoff) |

At this threshold, the model prioritises **sensitivity** (catching more true
positive CHD cases) at the cost of some specificity (more false positives).

> ⚠️ This is a research threshold. Clinical screening thresholds require
> prospective validation and regulatory oversight.

---

## Calibration

The Brier Score of **0.1159** indicates reasonable probability calibration —
the model's predicted probabilities are not badly miscalibrated relative to
the observed CHD rate (~15%). A perfectly calibrated model on this dataset
would achieve approximately 0.127 (the Brier Score of the naive "always
predict the base rate" model).

---

## Confusion Matrix (Held-out, threshold = 0.1684)

| | Predicted: No CHD | Predicted: CHD |
|---|---|---|
| **Actual: No CHD** | TN (Specificity 73.3%) | FP |
| **Actual: CHD** | FN | TP (Sensitivity 56.6%) |

---

## Limitations of These Metrics

1. **Single dataset** — All metrics are from the Framingham Heart Study dataset.
   Performance on other populations is unknown.

2. **Historical data** — The cohort data is decades old. Population health
   characteristics have changed.

3. **No recalibration** — No post-hoc probability calibration (e.g. Platt
   scaling, isotonic regression) was applied. Predicted probabilities may be
   over- or under-confident.

4. **Class imbalance** — Despite stratified splitting, the ~15% positive class
   means accuracy is a misleading metric (a model predicting "always no CHD"
   would have ~85% accuracy). ROC-AUC and PR-AUC are more informative.

5. **Threshold dependence** — Sensitivity and specificity values are specific
   to the 0.1684 threshold. Different thresholds yield different trade-offs.

---

## Comparison to Framingham Risk Score (Reference)

For context, the original Framingham Risk Score (FRS) — a points-based
clinical tool — typically achieves ROC-AUC ≈ 0.70–0.75 on the original
cohort. Our model's OOF AUC of **0.730** is consistent with this range,
confirming it has learned the expected signal without overfitting.

---

## Reproducibility

To reproduce evaluation results:

1. Use the Jupyter notebook in `research/notebooks/Framingham_Heart_Disease_Analysis.ipynb`
2. Ensure scikit-learn 1.6.1 is installed
3. Use the same random seed and stratified splits documented in the notebook
