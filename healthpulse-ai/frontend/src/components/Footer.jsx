export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-blue-700 mb-2">
              <span>🫀</span> HealthPulse AI
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              AI-powered health information platform. Powered by OpenFDA, Disease.sh, and modern NLP.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="font-semibold text-slate-700 mb-2">Features</p>
              <ul className="space-y-1 text-slate-500">
                <li>Symptom Checker</li>
                <li>Drug Information</li>
                <li>Disease Statistics</li>
                <li>FDA Recalls</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-2">Data Sources</p>
              <ul className="space-y-1 text-slate-500">
                <li>OpenFDA API</li>
                <li>Disease.sh API</li>
                <li>FDA FAERS Database</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>
            ⚠️ For educational and informational purposes only. Not a substitute for professional medical advice.
          </p>
          <p className="mt-1">
            Built by{' '}
            <a
              href="https://github.com/saijosyula"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Sai Josyula
            </a>{' '}
            · Data from OpenFDA &amp; Disease.sh (public APIs)
          </p>
        </div>
      </div>
    </footer>
  );
}
