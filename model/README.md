# Model Artifacts

This directory contains the serialised machine learning pipeline used by the
CardioXAI backend.

## Required files

| File | Description |
|------|-------------|
| `pipeline.joblib` | Trained sklearn Pipeline (SimpleImputer → StandardScaler → LogisticRegression) |
| `feature_names.json` | Ordered list of the 13 feature names in training order |
| `metadata.json` | Model version, classification threshold, positive class index |

## Placing the artifacts

Copy your trained artifacts into this directory:

```
model/artifacts/
├── pipeline.joblib        ← trained sklearn Pipeline
├── feature_names.json     ← ["age","male","cigsPerDay", ...]
└── metadata.json          ← {"model_version": "1.0.0", "threshold": 0.1684, ...}
```

The backend (`app/ml/model_loader.py`) reads from this directory at startup.
If `pipeline.joblib` is absent the API will still start, returning
`status: "ml_not_ready"` for all prediction requests.

## sklearn version

**scikit-learn must be `==1.6.1`** to load the pipeline correctly.
Installing a different version will cause an `AttributeError` on load.

## Version control

`pipeline.joblib` is listed in `.gitignore` and should not be committed to the
repository. Use a secure file share, model registry, or direct download to
distribute the artifact to team members.

## See also

- `model/MODEL_CARD.md` — full model card (training data, metrics, limitations)
- `docs/setup_guide.md §5` — step-by-step setup instructions
