import React from "react";
import {
  ShoppingCart,
  DollarSign,
  Zap,
  ExternalLink,
  Search,
  Sparkles,
} from "lucide-react";

export default function AbandonedCheckouts({
  abandonedSearchQuery,
  setAbandonedSearchQuery,
  wixLoading,
  wixStats,
}) {
  return (
    <div className="space-y-6">
      {wixLoading ? (
        <div className="bg-white rounded-3xl border border-outline-variant/30 py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#1B4965] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-secondary text-xs font-semibold">
            Henter forlatte handlekurver fra Wix...
          </p>
        </div>
      ) : (
        <>
          {/* Abandoned Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Forlatte kurver
                </p>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingCart size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-onyx">
                {wixStats?.abandonedCheckouts?.length || 0} stk
              </p>
              <p className="text-[11px] text-secondary mt-1">
                Uavsluttede kasser registrert
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Potensiell tapt omsetning
                </p>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <DollarSign size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-onyx">
                {(() => {
                  const total = (wixStats?.abandonedCheckouts || []).reduce(
                    (sum, ab) =>
                      sum + parseFloat(ab.totalPrice?.amount || ab.total || 0),
                    0,
                  );
                  return `${total.toLocaleString("no-NO")} kr`;
                })()}
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                Samlet handlekurv-verdi
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Gjenoppretting
                </p>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Zap size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-onyx">
                Wix Automasjon
              </p>
              <a
                href="https://manage.wix.com/dashboard/7682a906-41f6-4e8d-b0b1-bfdb5ee596e7/automations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#d17d39] font-bold hover:underline inline-flex items-center gap-1 mt-1"
              >
                <span>Sett opp e-postsekvens i Wix</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Abandoned Checkouts List */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-onyx text-base sm:text-lg">
                  Uavsluttede Kjøp & Forlatte Kurver
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Se hvilke produkter som lå i kassen da kunden forlot siden.
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Søk i forlatte kurver..."
                  value={abandonedSearchQuery}
                  onChange={(e) => setAbandonedSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-outline-variant/60 rounded-xl text-xs focus:outline-none focus:border-[#1B4965] focus:bg-white transition-all text-onyx"
                />
              </div>
            </div>

            <div className="p-6">
              {(wixStats?.abandonedCheckouts || []).length === 0 ? (
                <div className="py-12 text-center text-secondary max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart size={28} />
                  </div>
                  <h4 className="font-bold text-onyx text-sm">
                    Ingen forlatte handlekurver akkurat nå
                  </h4>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">
                    Når besøkende legger varer i kurven, fyller ut e-post i
                    kassen og ikke fullfører betalingen, vil de automatisk
                    listes opp her med varer og gjenopprettingslenker.
                  </p>
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-outline-variant/40 text-left text-xs space-y-1.5">
                    <p className="font-bold text-onyx flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#d17d39]" />
                      Tips: Automatisk oppfølging i Wix
                    </p>
                    <p className="text-secondary text-[11px] leading-normal">
                      I{" "}
                      <strong>
                        Wix Dashboard ➔ Markedsføring ➔ Automasjoner
                      </strong>{" "}
                      kan du aktivere automatisk utsendelse av e-post med
                      rabattkode 1 time etter at en kurv blir forlatt for å
                      hente kunden tilbake!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(wixStats?.abandonedCheckouts || [])
                    .filter((ab) => {
                      const q = abandonedSearchQuery.toLowerCase();
                      const buyerEmail = (
                        ab.buyerInfo?.email ||
                        ab.contactDetails?.emails?.[0] ||
                        ""
                      ).toLowerCase();
                      const buyerName = (
                        ab.buyerInfo?.name ||
                        ab.contactDetails?.firstName ||
                        ""
                      ).toLowerCase();
                      return buyerEmail.includes(q) || buyerName.includes(q);
                    })
                    .map((ab, idx) => (
                      <div
                        key={ab._id || idx}
                        className="p-5 rounded-2xl border border-outline-variant/40 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                              Forlatt kurv
                            </span>
                            <span className="text-[11px] text-secondary">
                              {ab._createdDate
                                ? new Date(ab._createdDate).toLocaleString(
                                    "no-NO",
                                  )
                                : "Nylig"}
                            </span>
                          </div>
                          <p className="font-bold text-xs text-onyx">
                            Kunde:{" "}
                            {ab.buyerInfo?.email ||
                              ab.contactDetails?.emails?.[0] ||
                              "Anonym besøkende"}
                          </p>
                          {ab.lineItems && ab.lineItems.length > 0 && (
                            <div className="text-xs text-secondary flex flex-wrap gap-2 pt-1">
                              {ab.lineItems.map((item, itemIdx) => (
                                <span
                                  key={itemIdx}
                                  className="bg-white border border-outline-variant/50 px-2 py-1 rounded-md text-[11px]"
                                >
                                  {item.quantity}x{" "}
                                  {item.productName?.original ||
                                    item.name ||
                                    "Produkt"}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-outline-variant/30">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] text-secondary font-bold uppercase">
                              Verdi
                            </p>
                            <p className="text-base font-extrabold text-onyx">
                              {ab.totalPrice?.amount
                                ? `${parseFloat(ab.totalPrice.amount).toLocaleString("no-NO")} kr`
                                : "-"}
                            </p>
                          </div>
                          {ab.checkoutUrl && (
                            <a
                              href={ab.checkoutUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#1B4965] hover:bg-[#153a50] text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                            >
                              <span>Gjenopprett kasse</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
