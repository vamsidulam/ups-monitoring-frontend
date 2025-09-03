import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Activity, Zap, TrendingUp, Cpu, LineChart, Bell, Lock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white">
      {/* Top Nav */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-xl font-bold text-gray-900">PowerWatch</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/sign-in"><Button variant="outline">Sign in</Button></Link>
          <Link to="/sign-up"><Button>Get started</Button></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
              <Cpu className="h-4 w-4" /> AI for critical power systems
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Monitor. Predict. Prevent.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              A professional UPS monitoring platform with real‑time health, anomaly detection, and AI failure predictions—built for reliability teams.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/sign-up"><Button className="bg-blue-600 hover:bg-blue-700">Create account</Button></Link>
              <Link to="/sign-in"><Button variant="outline">Sign in</Button></Link>
            </div>

            {/* Quick bullets */}
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <li className="flex items-center gap-2 text-slate-700"><Bell className="h-4 w-4 text-blue-600" /> Live metrics & smart alerts</li>
              <li className="flex items-center gap-2 text-slate-700"><TrendingUp className="h-4 w-4 text-green-600" /> AI failure predictions</li>
              <li className="flex items-center gap-2 text-slate-700"><Activity className="h-4 w-4 text-purple-600" /> Detailed analytics</li>
              <li className="flex items-center gap-2 text-slate-700"><Lock className="h-4 w-4 text-orange-600" /> Enterprise security</li>
            </ul>
          </div>

          {/* Product preview card */}
          <div className="relative">
            <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-2xl p-4">
              <div className="aspect-video w-full rounded-lg bg-slate-50 border flex items-center justify-center">
                <img src="/placeholder.svg" alt="Product preview" className="h-24 w-24 opacity-60" />
              </div>
              <div className="mt-4 rounded-lg bg-blue-50/70 border p-3 text-slate-700 text-sm">
                <strong className="text-blue-700">Tip:</strong> Sign in to access the live dashboard and real‑time data.
              </div>
            </div>
            <div className="pointer-events-none absolute -z-10 inset-0 bg-[radial-gradient(80%_50%_at_80%_0%,rgba(59,130,246,0.10),transparent)]" />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard icon={<Zap className="h-5 w-5 text-blue-600" />} title="Real‑time visibility" desc="Track battery, load, temperature, power I/O, and more in one place." />
          <FeatureCard icon={<LineChart className="h-5 w-5 text-green-600" />} title="Predictive insights" desc="AI models highlight risky devices early so you can plan maintenance." />
          <FeatureCard icon={<Shield className="h-5 w-5 text-purple-600" />} title="Reliable & secure" desc="Built with best‑practice security and audit‑friendly logging." />
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white text-2xl font-semibold">Start monitoring in minutes</h3>
            <p className="text-blue-100 mt-1">Create an account and connect your UPS data sources.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/sign-up"><Button className="bg-white text-blue-700 hover:bg-blue-50">Get started</Button></Link>
            <Link to="/sign-in"><Button variant="outline" className="border-white text-white hover:bg-white/10">Sign in</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 text-sm text-slate-500">
        © {new Date().getFullYear()} PowerWatch. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-white/70 backdrop-blur p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-slate-100">{icon}</div>
        <div>
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <p className="text-slate-600 text-sm mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}
