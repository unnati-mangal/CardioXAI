import { useNavigate } from 'react-router-dom';
import { Heart, ShieldCheck, FlaskConical, ChevronRight, Activity, Microscope } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

const features = [
  {
    icon: Activity,
    title: 'Hybrid AI Model',
    body: 'A trained Logistic Regression model with its fitted preprocessing pipeline, evaluated on the Framingham Heart Study dataset.',
  },
  {
    icon: FlaskConical,
    title: 'Explainable Predictions',
    body: 'SHAP values show how each clinical feature influenced the model score. LIME provides a locally faithful approximation for your specific inputs.',
  },
  {
    icon: ShieldCheck,
    title: 'Research-Based',
    body: 'Built exclusively on the Framingham dataset. Evaluation metrics include ROC-AUC, PR-AUC, Brier score, and calibration slope — honestly reported.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Enter Clinical Details',
    body: 'Provide 13 clinical and lifestyle measurements from the Framingham study protocol.',
  },
  {
    number: '02',
    title: 'Generate a Risk Estimate',
    body: 'The logistic regression pipeline produces a 10-year CHD probability for your submitted values.',
  },
  {
    number: '03',
    title: 'Explore the Explanations',
    body: 'SHAP and LIME charts reveal which features drove the model score — clearly labelled and honestly interpreted.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9F4] flex flex-col">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">

        <div className="flex-1 max-w-xl">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#397653] uppercase mb-4">
            Research Prototype · Not a Medical Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#24573D] leading-tight mb-5">
            Smarter Insights.<br className="hidden md:block" /> Healthier Hearts.
          </h1>
          <p className="text-[#687876] text-lg leading-relaxed mb-8">
            CardioXAI explores 10-year coronary heart disease risk using clinical and
            lifestyle data, with explainable AI insights to help users understand model predictions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => navigate('/auth')}>
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/predict')}
            >
              Try Prediction
            </Button>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex-shrink-0 w-64 md:w-80 opacity-90">
          <img
            src="/images/heart-illustration.svg"
            alt="Heart health illustration"
            className="w-full h-auto"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Fallback SVG if image missing */}
          <svg
            className="w-full h-auto hidden"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="100" cy="100" r="90" fill="#DDE9DD" opacity="0.4" />
            <path
              d="M100 140 C60 110 40 90 40 70 C40 50 60 40 80 50 C90 55 100 65 100 65 C100 65 110 55 120 50 C140 40 160 50 160 70 C160 90 140 110 100 140Z"
              fill="#397653"
              opacity="0.8"
            />
          </svg>
        </div>

      </section>

      {/* ── Feature highlights ──────────────────────────────── */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#24573D] mb-3">
              Built for Research
            </h2>
            <p className="text-[#687876] max-w-xl mx-auto">
              A transparent, research-grade tool for understanding cardiovascular risk
              prediction — not a clinical diagnostic system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-[#FAF9F4] rounded-2xl p-6 border border-[#E4E8E0] hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#DDE9DD] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#397653]" />
                </div>
                <h3 className="font-semibold text-[#253638] mb-2">{title}</h3>
                <p className="text-sm text-[#687876] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto w-full px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#24573D] mb-3">
            How It Works
          </h2>
          <p className="text-[#687876] max-w-xl mx-auto">
            Three steps from sign-up to a fully explainable risk assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ number, title, body }) => (
            <div key={number} className="flex flex-col items-start gap-3">
              <span className="text-4xl font-bold text-[#DDE9DD] leading-none select-none">
                {number}
              </span>
              <h3 className="font-semibold text-[#253638]">{title}</h3>
              <p className="text-sm text-[#687876] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 flex justify-center">
          <Button variant="primary" onClick={() => navigate('/auth')}>
            <Heart className="w-4 h-4" />
            Start Your Assessment
          </Button>
        </div>
      </section>

      {/* ── Disclaimer banner ───────────────────────────────── */}
      <section className="bg-[#F9E6E2] border-y border-[#E4E8E0] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <Microscope className="w-5 h-5 text-[#E88E84] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#253638] mb-0.5">Research &amp; Educational Use Only</p>
            <p className="text-sm text-[#687876] leading-relaxed">
              CardioXAI is a research prototype built on the Framingham Heart Study dataset.
              It does <strong>not</strong> provide medical advice and is <strong>not</strong> a substitute
              for professional clinical assessment. Always consult a qualified healthcare professional
              for medical decisions.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
