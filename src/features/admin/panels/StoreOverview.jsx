import React from "react";
import {
  ShieldAlert,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Globe,
  ShieldCheck,
} from "lucide-react";

export default function StoreOverview({
  activeGaStats,
  activeWixStats,
  generateAreaPath,
  generatePath,
  maxSalesVal,
  maxVisitsVal,
  wixError,
  wixLoading,
}) {
  return (
    <div className="space-y-6">
      {wixLoading ? (
        <div className="bg-white rounded-3xl border border-outline-variant/30 py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#1B4965] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-secondary text-xs font-semibold">
            Henter virkelige Wix salgsdata...
          </p>
        </div>
      ) : wixError ? (
        <div className="bg-white rounded-3xl border border-outline-variant/30 p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <h3 className="font-bold text-onyx text-sm">
            Kunne ikke koble til Wix Butikkdata
          </h3>
          <p className="text-xs text-secondary leading-relaxed max-w-md mx-auto">
            Kunne ikke hente reelle ordrer fra Wix. Vennligst sjekk at
            API-nøkkelen (WIX_API_KEY) er gyldig og lagret i dine
            Vercel-miljøvariabler.
          </p>
          <pre className="bg-slate-50 text-rose-700 p-3 rounded-lg text-[10px] font-mono overflow-x-auto max-w-md mx-auto text-left border">
            Feilmelding: {wixError}
          </pre>
        </div>
      ) : (
        <>
          {/* Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-3 text-left">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 bg-[#1B4965]/10 text-[#1B4965] rounded-xl flex items-center justify-center shrink-0">
                  <DollarSign size={18} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                  <TrendingUp size={10} />
                  {activeWixStats.revenueChange}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Salg (Wix)
                </p>
                <p className="text-lg font-extrabold text-onyx mt-0.5">
                  {activeWixStats.revenue}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-3 text-left">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 bg-[#d17d39]/10 text-[#d17d39] rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                  <TrendingUp size={10} />
                  {activeWixStats.ordersChange}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Ordrer
                </p>
                <p className="text-lg font-extrabold text-onyx mt-0.5">
                  {activeWixStats.orders}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-3 text-left">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp size={18} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                  <TrendingUp size={10} />
                  {activeWixStats.aovChange}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Gj. ordreverdi
                </p>
                <p className="text-lg font-extrabold text-onyx mt-0.5">
                  {activeWixStats.aov}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-3 text-left">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                  Google GA4
                </span>
              </div>
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Unike besøk
                </p>
                <p className="text-lg font-extrabold text-onyx mt-0.5">
                  {activeGaStats.visitors}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-3 text-left">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                  <Globe size={18} />
                </div>
                <span className="text-[10px] font-bold text-[#1B4965] bg-slate-50 px-2 py-0.5 rounded-full border flex items-center gap-0.5">
                  Registrert
                </span>
              </div>
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Kunder i Wix
                </p>
                <p className="text-lg font-extrabold text-onyx mt-0.5">
                  {activeWixStats.totalContacts} stk
                </p>
              </div>
            </div>
          </div>

          {/* Main Line Chart */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 shadow-sm text-left">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-onyx text-base">
                  Reell salgsutvikling (Wix)
                </h3>
                <p className="text-xs text-secondary">
                  Statistikk basert på ordredatoer og transaksjonsbeløp.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3 bg-[#1B4965] rounded-full"></span>
                  <span className="text-secondary">Salg (kr)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3 bg-[#d17d39] rounded-full"></span>
                  <span className="text-secondary">Besøk (estimert)</span>
                </div>
              </div>
            </div>

            {/* SVG Line Graph */}
            <div className="w-full relative h-[220px]">
              <svg
                viewBox="0 0 500 200"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B4965" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1B4965" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d17d39" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#d17d39" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line
                  x1="20"
                  y1="35"
                  x2="480"
                  y2="35"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="70"
                  x2="480"
                  y2="70"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="105"
                  x2="480"
                  y2="105"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="140"
                  x2="480"
                  y2="140"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="175"
                  x2="480"
                  y2="175"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                />

                {/* Area fills */}
                <path
                  d={generateAreaPath(
                    activeWixStats.chartData.sales,
                    maxSalesVal,
                  )}
                  fill="url(#salesGrad)"
                />
                <path
                  d={generateAreaPath(activeGaStats.chartData, maxVisitsVal)}
                  fill="url(#visitsGrad)"
                />

                {/* Line paths */}
                <path
                  d={generatePath(activeWixStats.chartData.sales, maxSalesVal)}
                  fill="none"
                  stroke="#1B4965"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d={generatePath(activeGaStats.chartData, maxVisitsVal)}
                  fill="none"
                  stroke="#d17d39"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="3 3"
                />
              </svg>

              {/* Interactive Data points as absolute HTML divs to prevent scaling issues */}
              {activeWixStats.chartData.sales.map((val, i) => {
                const x =
                  20 + (i / (activeWixStats.chartData.sales.length - 1)) * 460;
                const y = 175 - (val / maxSalesVal) * 140;
                const leftPct = (x / 500) * 100;
                const topPct = (y / 200) * 100;
                return (
                  <div
                    key={i}
                    className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#1B4965] border-2 border-white shadow-sm -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      pointerEvents: "none",
                    }}
                  />
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between items-center text-[10px] text-secondary/70 font-bold px-4 pt-3 border-t">
              {activeWixStats.chartData.labels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>

          {/* Highlights and Cookie Consent snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key insights */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left space-y-4">
              <h4 className="font-bold text-onyx text-sm uppercase tracking-wider">
                Høydepunkter denne perioden
              </h4>
              <ul className="space-y-3.5 text-xs text-secondary">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                  <p>
                    Reell omsetning for de valgte ordrene utgjør{" "}
                    <strong className="text-onyx">
                      {activeWixStats.revenue}
                    </strong>{" "}
                    fordelt på{" "}
                    <strong className="text-onyx">
                      {activeWixStats.orders} ordrer
                    </strong>
                    .
                  </p>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                  <p>
                    Gjennomsnittlig verdi per fullførte ordre ligger på{" "}
                    <strong className="text-onyx">{activeWixStats.aov}</strong>.
                  </p>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-[#1B4965] rounded-full mt-1.5 shrink-0"></div>
                  <p>
                    Det er registrert totalt{" "}
                    <strong className="text-onyx">
                      {activeWixStats.totalContacts} unike kundeprofiler
                    </strong>{" "}
                    i Wix-databasen.
                  </p>
                </li>
              </ul>
            </div>

            {/* Cookie Consent tracking banner */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left flex flex-col justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-onyx text-sm uppercase tracking-wider">
                  GDPR Cookie-samtykke
                </h4>
                <p className="text-xs text-secondary leading-relaxed">
                  Andel av brukerne som samtykker til sporing (Google Analytics)
                  vs. kun nødvendige.
                </p>
              </div>

              <div className="my-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#1B4965] flex items-center gap-1.5">
                    <ShieldCheck size={14} />
                    Full sporing (Godtatt)
                  </span>
                  <span>{activeWixStats.cookieAll}%</span>
                </div>

                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#1B4965]"
                    style={{ width: `${activeWixStats.cookieAll}%` }}
                  ></div>
                  <div
                    className="bg-[#d17d39]"
                    style={{ width: `${activeWixStats.cookieNec}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-secondary">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-[#d17d39]" />
                    Kun nødvendig cookies
                  </span>
                  <span>{activeWixStats.cookieNec}%</span>
                </div>
              </div>

              <p className="text-[10px] text-secondary/60">
                * Statistikken er estimert basert på samtykke-valg utført i
                nettleserne.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
