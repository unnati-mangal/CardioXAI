import { Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#E4E8E0]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#DDE9DD] flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-[#397653]" />
              </div>
              <span className="font-semibold text-[#24573D]">CardioXAI</span>
            </div>
            <p className="text-sm text-[#687876] leading-relaxed">
              Hybrid explainable AI for heart disease risk prediction, built on the
              Framingham Heart Study dataset.
            </p>
          </div>

          {/* Research notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#253638] mb-3">Research Prototype</h4>
            <p className="text-sm text-[#687876] leading-relaxed">
              This application is an academic research project. It does not provide
              clinical advice or replace a qualified healthcare professional.
            </p>
          </div>

          {/* Medical disclaimer */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#253638] mb-3">Medical Disclaimer</h4>
            <p className="text-sm text-[#687876] leading-relaxed">
              Risk estimates are probabilistic model outputs, not diagnoses.
              Always consult a licensed clinician for medical decisions.
            </p>
          </div>

        </div>

        <div className="border-t border-[#E4E8E0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#687876]">
            © {year} CardioXAI &middot; Academic Research Project
          </p>
          <p className="text-xs text-[#687876]">
            Not validated for clinical use &middot; Research &amp; education only
          </p>
        </div>
      </div>
    </footer>
  );
}
