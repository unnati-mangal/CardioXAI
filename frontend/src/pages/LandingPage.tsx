import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ── Inline SVG illustrations ─────────────────────────────────────── */

/** The salmon heart + green leaves + ECG illustration used in hero */
function HeartIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Large light-green circle background */}
      <circle cx="160" cy="160" r="150" fill="#DFF0E3" />

      {/* ── Leaf sprigs (behind heart) ── */}
      {/* Bottom-left branch */}
      <g opacity="0.85">
        <ellipse cx="80" cy="220" rx="22" ry="10" fill="#6BAF7A" transform="rotate(-40 80 220)" />
        <ellipse cx="60" cy="238" rx="20" ry="9" fill="#7FC48C" transform="rotate(-55 60 238)" />
        <ellipse cx="48" cy="258" rx="18" ry="8" fill="#6BAF7A" transform="rotate(-65 48 258)" />
        <line x1="80" y1="220" x2="50" y2="265" stroke="#5A9B68" strokeWidth="1.5" />
      </g>
      {/* Top-right branch */}
      <g opacity="0.85">
        <ellipse cx="248" cy="98" rx="22" ry="10" fill="#6BAF7A" transform="rotate(35 248 98)" />
        <ellipse cx="268" cy="80" rx="20" ry="9" fill="#7FC48C" transform="rotate(50 268 80)" />
        <ellipse cx="280" cy="62" rx="18" ry="8" fill="#6BAF7A" transform="rotate(65 280 62)" />
        <line x1="248" y1="98" x2="278" y2="58" stroke="#5A9B68" strokeWidth="1.5" />
      </g>
      {/* Right-mid leaves */}
      <g opacity="0.75">
        <ellipse cx="270" cy="155" rx="20" ry="9" fill="#88C496" transform="rotate(15 270 155)" />
        <ellipse cx="282" cy="138" rx="18" ry="8" fill="#6BAF7A" transform="rotate(30 282 138)" />
      </g>
      {/* Left-mid leaves */}
      <g opacity="0.75">
        <ellipse cx="52" cy="148" rx="20" ry="9" fill="#88C496" transform="rotate(-15 52 148)" />
        <ellipse cx="40" cy="132" rx="18" ry="8" fill="#6BAF7A" transform="rotate(-30 40 132)" />
      </g>
      {/* Top-left small leaves */}
      <g opacity="0.7">
        <ellipse cx="105" cy="72" rx="16" ry="7" fill="#7FC48C" transform="rotate(-45 105 72)" />
        <ellipse cx="90"  cy="60" rx="14" ry="6" fill="#6BAF7A" transform="rotate(-55 90 60)" />
      </g>
      {/* Bottom-right small leaves */}
      <g opacity="0.7">
        <ellipse cx="220" cy="255" rx="16" ry="7" fill="#7FC48C" transform="rotate(45 220 255)" />
        <ellipse cx="235" cy="268" rx="14" ry="6" fill="#6BAF7A" transform="rotate(55 235 268)" />
      </g>

      {/* ── Salmon / coral heart ── */}
      <path
        d="M160 230
           C120 200 72 175 72 135
           C72 108 92 90 116 90
           C134 90 150 101 160 115
           C170 101 186 90 204 90
           C228 90 248 108 248 135
           C248 175 200 200 160 230Z"
        fill="#F4957A"
        opacity="0.92"
      />
      {/* Highlight on heart */}
      <path
        d="M120 108 C114 118 112 130 116 142"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* ── White ECG line over the heart ── */}
      <polyline
        points="100,155 118,155 128,132 140,178 152,155 172,155 182,142 192,168 202,155 222,155"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}

/** Small version of the illustration for auth page left panel */
function HeartIllustrationSmall({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="130" cy="130" r="120" fill="#C8E6CE" opacity="0.6" />
      {/* leaves */}
      <g opacity="0.8">
        <ellipse cx="65"  cy="178" rx="18" ry="8"  fill="#6BAF7A" transform="rotate(-40 65 178)" />
        <ellipse cx="50"  cy="193" rx="16" ry="7"  fill="#7FC48C" transform="rotate(-55 50 193)" />
        <ellipse cx="200" cy="80"  rx="18" ry="8"  fill="#6BAF7A" transform="rotate(35 200 80)" />
        <ellipse cx="215" cy="65"  rx="16" ry="7"  fill="#7FC48C" transform="rotate(50 215 65)" />
        <ellipse cx="215" cy="130" rx="16" ry="7"  fill="#88C496" transform="rotate(15 215 130)" />
        <ellipse cx="45"  cy="120" rx="16" ry="7"  fill="#88C496" transform="rotate(-15 45 120)" />
      </g>
      {/* heart */}
      <path
        d="M130 188 C98 163 58 143 58 110 C58 88 75 73 95 73 C110 73 123 82 130 93 C137 82 150 73 165 73 C185 73 202 88 202 110 C202 143 162 163 130 188Z"
        fill="#F4957A"
        opacity="0.88"
      />
      {/* ECG */}
      <polyline
        points="80,126 95,126 103,108 113,144 122,126 138,126 146,115 156,137 164,126 182,126"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}

/* ── Feature cards data ───────────────────────────────────────────── */

const features = [
  {
    emoji: '🧬',
    title: 'Hybrid AI Model',
    body:  'Combines multiple approaches for better accuracy.',
  },
  {
    emoji: '📊',
    title: 'Explainable Predictions',
    body:  'See what factors influence your risk, with SHAP & LIME.',
  },
  {
    emoji: '📋',
    title: 'Research Based',
    body:  'Built on Framingham dataset with rigorous evaluation.',
  },
];

/* ── Page ─────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7FAF7] flex flex-col">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto w-full px-6 pt-14 pb-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">

        {/* Left copy */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold tracking-[0.18em] text-[#3D7A5A] uppercase mb-5">
            AI FOR A HEALTHIER TOMORROW
          </p>
          <h1 className="text-[2.6rem] md:text-[3.2rem] font-extrabold text-[#1C2B22] leading-[1.15] mb-1">
            Smarter Insights.
          </h1>
          <h1 className="text-[2.6rem] md:text-[3.2rem] font-extrabold text-[#3D7A5A] leading-[1.15] mb-6">
            Healthier Hearts.
          </h1>
          <p className="text-[#5A6F62] text-[0.97rem] leading-[1.7] mb-8 max-w-[420px]">
            CardioXAI uses a hybrid explainable AI model to predict your
            10-year risk of heart disease using clinical and lifestyle data —
            with clear, understandable explanations.
          </p>

          {/* Buttons — pill shape, matching design */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 bg-[#2A5940] text-white text-sm font-semibold
                         px-6 py-2.5 rounded-full hover:bg-[#1e4530] transition-colors"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/predict')}
              className="inline-flex items-center gap-2 bg-transparent text-[#2A5940] text-sm font-semibold
                         px-6 py-2.5 rounded-full border border-[#2A5940] hover:bg-[#EAF2EC] transition-colors"
            >
              Try Prediction
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap gap-6">
            {[
              { icon: '🫀', label: 'AI-Powered Prediction'  },
              { icon: '📊', label: 'Explainable Results'    },
              { icon: '🔒', label: 'Data Privacy Focused'   },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="text-xs font-medium text-[#5A6F62]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right illustration */}
        <div className="flex-shrink-0 flex flex-col items-end gap-3">
          <HeartIllustration className="w-[260px] h-[260px] md:w-[310px] md:h-[310px]" />
          {/* Tagline — right-aligned, italic */}
          <div className="text-right pr-2">
            <p className="text-sm text-[#5A6F62] italic">Better data.</p>
            <p className="text-sm text-[#5A6F62] italic">Clearer answers.</p>
            <p className="text-sm text-[#3D7A5A] italic font-semibold">Healthier decisions.</p>
          </div>
        </div>

      </section>

      {/* ── Why CardioXAI ──────────────────────────────────── */}
      <section id="about" className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-10">

          {/* Left text */}
          <div className="md:w-72 flex-shrink-0">
            <h2 className="text-2xl font-bold text-[#1C2B22] mb-3">Why CardioXAI?</h2>
            <p className="text-[#5A6F62] text-sm leading-relaxed">
              We combine the power of machine learning with explainability tools
              like SHAP and LIME, so you not only get a prediction, but also
              understand the key factors behind it.
            </p>
          </div>

          {/* Feature cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4" id="features">
            {features.map(({ emoji, title, body }) => (
              <div key={title} className="bg-[#F7FAF7] rounded-2xl border border-[#DDE8DD] p-5">
                <div className="w-10 h-10 rounded-xl bg-[#DFF0E3] flex items-center justify-center mb-3 text-lg">
                  {emoji}
                </div>
                <h3 className="font-semibold text-[#1C2B22] text-sm mb-1">{title}</h3>
                <p className="text-xs text-[#5A6F62] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Disclaimer ────────────────────────────────────── */}
      <section className="bg-white border-t border-[#DDE8DD] py-5">
        <p className="text-center text-xs text-[#7A9585] max-w-2xl mx-auto px-6">
          ⚠️ Research prototype only. Not a medical device. Not validated for clinical use.
          Always consult a qualified healthcare professional.
        </p>
      </section>

      <Footer />
    </div>
  );
}
