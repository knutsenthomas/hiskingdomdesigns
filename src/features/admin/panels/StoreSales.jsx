import React from "react";
import { ShieldAlert, TrendingUp, ExternalLink } from "lucide-react";

export default function StoreSales({
  activeWixStats,
  maxSalesVal,
  wixError,
  wixLoading,
}) {
  return (
    <div className="space-y-6">
      {wixLoading ? (
        <div className="bg-white rounded-3xl border border-outline-variant/30 py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#1B4965] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-secondary text-xs font-semibold">
            Henter reelle Wix salgstall...
          </p>
        </div>
      ) : wixError ? (
        <div className="bg-white rounded-3xl border border-outline-variant/30 p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <h3 className="font-bold text-onyx text-sm">
            Tilkobling til Wix feilet
          </h3>
          <p className="text-xs text-secondary leading-relaxed max-w-md mx-auto">
            Kan ikke hente omsetningsdata fordi API-tilkoblingen til Wix er
            offline eller mangler rettigheter.
          </p>
          <pre className="bg-slate-50 text-rose-700 p-3 rounded-lg text-[10px] font-mono overflow-x-auto max-w-md mx-auto text-left border">
            Feil: {wixError}
          </pre>
        </div>
      ) : (
        <>
          {/* Sales metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                Total omsetning
              </p>
              <p className="text-2xl font-extrabold text-onyx mt-1">
                {activeWixStats.revenue}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-2">
                <TrendingUp size={12} />
                <span>
                  {activeWixStats.revenueChange} endring fra forrige tilsvarende
                  periode
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                Gjennomsnittlig ordreverdi
              </p>
              <p className="text-2xl font-extrabold text-onyx mt-1">
                {activeWixStats.aov}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-2">
                <TrendingUp size={12} />
                <span>
                  {activeWixStats.aovChange} i forhold til snittet før
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                Fullførte salg
              </p>
              <p className="text-2xl font-extrabold text-onyx mt-1">
                {activeWixStats.orders} stk
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-2">
                <TrendingUp size={12} />
                <span>{activeWixStats.ordersChange} i ordretrend</span>
              </div>
            </div>
          </div>

          {/* Revenue Distribution and Category Chart */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Category bar progress */}
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm text-left space-y-5">
              <div>
                <h4 className="font-bold text-onyx text-base">
                  Reell salgsfordeling
                </h4>
                <p className="text-xs text-secondary">
                  Fordelt etter varelinjer i de mottatte ordrene.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {activeWixStats.categories.map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-onyx">{cat.label}</span>
                      <span className="text-secondary font-semibold">
                        {cat.pct}% ({cat.amount})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${cat.color} h-full rounded-full`}
                        style={{ width: `${cat.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Bar Chart */}
            <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm text-left">
              <div className="mb-4">
                <h4 className="font-bold text-onyx text-base">
                  Omsetningstrend
                </h4>
                <p className="text-xs text-secondary">
                  Fordeling av salg per tidsperiode (søyler).
                </p>
              </div>

              {/* SVG Bar Chart */}
              <div className="w-full relative h-[180px]">
                <svg
                  viewBox="0 0 500 200"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="20"
                    y1="175"
                    x2="480"
                    y2="175"
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                  />
                  {activeWixStats.chartData.sales.map((val, i) => {
                    const count = activeWixStats.chartData.sales.length;
                    const barWidth = count === 7 ? 35 : count === 12 ? 22 : 45;
                    const gap = count === 7 ? 28 : count === 12 ? 15 : 60;
                    const x = 25 + i * (barWidth + gap);
                    const h = val > 0 ? (val / maxSalesVal) * 140 : 0;
                    const y = 175 - h;
                    return (
                      <g key={i} className="group cursor-pointer">
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={h}
                          rx="3"
                          fill="#1B4965"
                          className="opacity-95 hover:fill-[#d17d39] transition-colors duration-200"
                        />
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          className="text-[9px] font-bold fill-onyx opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {Math.round(val)} kr
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Bar chart labels */}
              <div className="flex justify-between items-center text-[10px] text-secondary/70 font-bold px-4 pt-2 border-t">
                {activeWixStats.chartData.labels.map((m, idx) => (
                  <span key={idx}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Wix Orders Table */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-sm text-left space-y-6">
            <div>
              <h4 className="font-bold text-onyx text-base">
                Reelle ordrer fra Wix-butikken
              </h4>
              <p className="text-xs text-secondary">
                Nylige gjennomførte og registrerte ordrer i nettbutikken.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-secondary/80 uppercase font-bold tracking-wider whitespace-nowrap">
                    <th className="py-5 px-6">Dato</th>
                    <th className="py-5 px-6">Varer kjøpt</th>
                    <th className="py-5 px-6">Ordre ID</th>
                    <th className="py-5 px-6">Kunde</th>
                    <th className="py-5 px-6">Totalbeløp</th>
                    <th className="py-5 px-6 text-center">Sendt</th>
                    <th className="py-5 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeWixStats.ordersList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-8 text-center text-secondary font-medium whitespace-nowrap"
                      >
                        Ingen registrerte ordrer funnet for denne perioden.
                      </td>
                    </tr>
                  ) : (
                    activeWixStats.ordersList.map((order, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-5 px-6 text-secondary whitespace-nowrap">
                          {order.date}
                        </td>
                        <td
                          className="py-5 px-6 text-secondary italic truncate max-w-[360px]"
                          title={order.items}
                        >
                          {order.items}
                        </td>
                        <td className="py-5 px-6 font-bold text-[#1B4965] whitespace-nowrap">
                          {order.wixOrderId ? (
                            <a
                              href={`https://manage.wix.com/dashboard/7682a906-41f6-4e8d-b0b1-bfdb5ee596e7/store/orders/order/${order.wixOrderId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[#d17d39] hover:underline transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              title="Se ordredetaljer i Wix Dashboard"
                            >
                              {order.id}
                              <ExternalLink
                                size={13}
                                className="shrink-0 text-secondary"
                              />
                            </a>
                          ) : (
                            order.id
                          )}
                        </td>
                        <td className="py-5 px-6 font-semibold text-onyx whitespace-nowrap">
                          {order.customer}
                        </td>
                        <td className="py-5 px-6 font-bold text-onyx whitespace-nowrap">
                          {order.amount}
                        </td>
                        <td className="py-5 px-6 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              order.fulfillmentStatus === "FULFILLED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : order.fulfillmentStatus ===
                                    "PARTIALLY_FULFILLED"
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {order.fulfillmentStatus === "FULFILLED"
                              ? "Ja"
                              : order.fulfillmentStatus ===
                                  "PARTIALLY_FULFILLED"
                                ? "Delvis"
                                : "Nei"}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              order.status.toLowerCase() === "delivered" ||
                              order.status.toLowerCase() === "paid" ||
                              order.status.toLowerCase() === "fulfilled" ||
                              order.status.toLowerCase() === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {order.status === "PAID"
                              ? "Betalt"
                              : order.status === "DELIVERED"
                                ? "Sendt"
                                : order.status === "FULFILLED"
                                  ? "Fullført"
                                  : order.status === "APPROVED"
                                    ? "Godkjent"
                                    : order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
