import React, { useEffect, useState } from "react";
import { Search, ShoppingBag, RefreshCw, AlertTriangle } from "lucide-react";
import { wixClient } from "@/lib/wix";

const STATUS_LABELS = {
  ELIGIBLE: "Godkjent",
  ELIGIBLE_LIMITED: "Begrenset",
  PENDING: "Under behandling",
  NOT_ELIGIBLE_OR_DISAPPROVED: "Avvist",
  UNKNOWN: "Ukjent",
};

const nf = (n) => new Intl.NumberFormat("nb-NO").format(Math.round(n || 0));

function Card({ label, value, sub }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-onyx">{value}</p>
      {sub && <p className="text-[11px] text-secondary mt-1">{sub}</p>}
    </div>
  );
}

function Table({ title, rows, firstCol }) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden text-left">
      <p className="px-5 pt-4 pb-2 text-xs font-bold text-onyx">{title}</p>
      {rows.length === 0 ? (
        <p className="px-5 pb-4 text-xs text-secondary">Ingen data ennå.</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-secondary text-[10px] uppercase tracking-wider">
              <th className="px-5 py-2 text-left font-bold">{firstCol}</th>
              <th className="px-3 py-2 text-right font-bold">Klikk</th>
              <th className="px-3 py-2 text-right font-bold">Visninger</th>
              <th className="px-5 py-2 text-right font-bold">Posisjon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-outline-variant/20">
                <td className="px-5 py-2 text-onyx break-all">{r.key.replace("https://hiskingdomdesigns.no", "") || "/"}</td>
                <td className="px-3 py-2 text-right">{nf(r.clicks)}</td>
                <td className="px-3 py-2 text-right">{nf(r.impressions)}</td>
                <td className="px-5 py-2 text-right">{r.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function SearchVisibility() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = wixClient.auth?.getTokens?.()?.accessToken?.value;
        const r = await fetch("/api/get-search-stats?days=28", {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        if (!r.ok) throw new Error(`Klarte ikke å hente data (status ${r.status})`);
        const json = await r.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reload]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-outline-variant/30 py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1B4965] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-secondary text-xs font-semibold">Henter data fra Search Console og Merchant Center...</p>
      </div>
    );
  }
  if (error) {
    return <div className="bg-white rounded-2xl border border-red-200 p-6 text-left text-sm text-red-700">{error}</div>;
  }

  const gsc = data?.searchConsole || {};
  const mc = data?.merchantCenter || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="flex items-center gap-2 text-sm font-bold text-onyx"><Search size={16} /> Google Søk (Search Console)</h2>
        <button onClick={() => setReload((n) => n + 1)} className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-onyx">
          <RefreshCw size={14} /> Oppdater
        </button>
      </div>

      {gsc.error ? (
        <div className="bg-white rounded-2xl border border-amber-200 p-5 text-left text-xs text-amber-800 flex gap-2"><AlertTriangle size={16} /> {gsc.error}</div>
      ) : (
        <>
          <p className="text-[11px] text-secondary text-left">Periode: {gsc.period?.start} – {gsc.period?.end}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Klikk" value={nf(gsc.totals?.clicks)} />
            <Card label="Visninger" value={nf(gsc.totals?.impressions)} />
            <Card label="Klikkrate" value={`${gsc.totals?.ctr ?? 0} %`} />
            <Card label="Snittposisjon" value={gsc.totals?.position || "–"} />
          </div>
          {(gsc.sitemaps || []).map((s) => (
            <p key={s.path} className="text-[11px] text-secondary text-left">
              Nettstedskart: {s.submitted} sider sendt inn · {s.errors} feil · {s.warnings} advarsler · sist lest {s.lastDownloaded?.slice(0, 10) || "–"}
            </p>
          ))}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Table title="Viktigste søk" rows={gsc.topQueries || []} firstCol="Søk" />
            <Table title="Viktigste sider" rows={gsc.topPages || []} firstCol="Side" />
          </div>
        </>
      )}

      <h2 className="flex items-center gap-2 text-sm font-bold text-onyx pt-2"><ShoppingBag size={16} /> Google Shopping (Merchant Center)</h2>
      {mc.error ? (
        <div className="bg-white rounded-2xl border border-amber-200 p-5 text-left text-xs text-amber-800 flex gap-2"><AlertTriangle size={16} /> {mc.error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Produkter" value={nf(mc.totalProducts)} />
            {Object.entries(mc.status || {}).map(([k, v]) => (
              <Card key={k} label={STATUS_LABELS[k] || k} value={nf(v)} />
            ))}
            {mc.performance && !mc.performance.error && (
              <Card label="Shopping-klikk" value={nf(mc.performance.clicks)} sub={`${nf(mc.performance.impressions)} visninger`} />
            )}
          </div>
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm text-left">
            <p className="px-5 pt-4 pb-2 text-xs font-bold text-onyx">Vanligste problemer</p>
            {(mc.topIssues || []).length === 0 ? (
              <p className="px-5 pb-4 text-xs text-secondary">Ingen problemer funnet.</p>
            ) : (
              <ul className="px-5 pb-4 space-y-1 text-xs">
                {mc.topIssues.map((i) => (
                  <li key={i.code} className="flex justify-between gap-4">
                    <span className="text-onyx">{i.code}</span>
                    <span className="text-secondary whitespace-nowrap">{nf(i.count)} produkter</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
