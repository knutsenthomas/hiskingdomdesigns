import React from "react";
import {
  Users,
  UserCheck,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  Check,
  Eye,
} from "lucide-react";

export default function StoreCustomers({
  customerSearchQuery,
  filteredCustomers,
  getCustomerOrders,
  setCustomerSearchQuery,
  setSelectedCustomerModal,
  wixLoading,
  wixStats,
}) {
  return (
    <div className="space-y-6">
      {wixLoading ? (
        <div className="bg-white rounded-3xl border border-outline-variant/30 py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#1B4965] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-secondary text-xs font-semibold">
            Henter registrerte kunder og medlemmer fra Wix...
          </p>
        </div>
      ) : (
        <>
          {/* Customer Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Totalt registrerte
                </p>
                <div className="w-8 h-8 rounded-lg bg-[#1B4965]/10 text-[#1B4965] flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-onyx">
                {wixStats?.members?.length || wixStats?.totalContacts || 0}
              </p>
              <p className="text-[11px] text-secondary mt-1">
                Kunder & nettstedsmedlemmer
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Aktive profiler
                </p>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-onyx">
                {
                  (wixStats?.members || []).filter(
                    (m) =>
                      m.status === "APPROVED" ||
                      m.activityStatus === "ACTIVE" ||
                      !m.status ||
                      m.status === "UNKNOWN",
                  ).length
                }
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                Godkjente medlemskontoer
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Kunder med kjøp
                </p>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-onyx">
                {(() => {
                  const orders = wixStats?.orders || [];
                  const buyerEmails = new Set(
                    orders
                      .map((o) => (o.buyerInfo?.email || "").toLowerCase())
                      .filter(Boolean),
                  );
                  const memberEmails = (wixStats?.members || []).map((m) =>
                    (
                      m.loginEmail ||
                      m.contact?.emails?.[0]?.email ||
                      ""
                    ).toLowerCase(),
                  );
                  return memberEmails.filter((e) => buyerEmails.has(e)).length;
                })()}
              </p>
              <p className="text-[11px] text-secondary mt-1">
                Gjentakende betalende kunder
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                  Wix CRM Kontakter
                </p>
                <div className="w-8 h-8 rounded-lg bg-[#d17d39]/10 text-[#d17d39] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-onyx">
                {wixStats?.totalContacts || (wixStats?.members || []).length}
              </p>
              <a
                href="https://manage.wix.com/dashboard/7682a906-41f6-4e8d-b0b1-bfdb5ee596e7/contacts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#d17d39] font-bold hover:underline inline-flex items-center gap-1 mt-1"
              >
                <span>Åpne i Wix Dashboard</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Customer Search & Table */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-onyx text-base sm:text-lg">
                  Kunder & Nettstedsmedlemmer
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Oversikt over alle registrerte profiler med kontaktinformasjon
                  og kjøpsaktivitet.
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Søk navn, e-post, telefon, by..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-outline-variant/60 rounded-xl text-xs focus:outline-none focus:border-[#1B4965] focus:bg-white transition-all text-onyx"
                />
                {customerSearchQuery && (
                  <button
                    onClick={() => setCustomerSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-onyx"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-outline-variant/30 text-[10px] font-bold text-secondary uppercase tracking-wider">
                    <th className="py-4 px-6">Kunde / Profil</th>
                    <th className="py-4 px-6">Kontaktinfo</th>
                    <th className="py-4 px-6">Adresse</th>
                    <th className="py-4 px-6 text-center">Registrert</th>
                    <th className="py-4 px-6 text-center">Ordrer & Kjøp</th>
                    <th className="py-4 px-6 text-right">Handlinger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-secondary"
                      >
                        <Users
                          size={32}
                          className="mx-auto text-slate-300 mb-2"
                        />
                        <p className="font-semibold text-xs text-onyx">
                          Ingen kunder matcher søket
                        </p>
                        <p className="text-[11px] text-secondary mt-1">
                          Prøv et annet søkeord eller tilbakestill filteret.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => {
                      const custOrders = getCustomerOrders(cust);
                      const totalSpent = custOrders.reduce(
                        (sum, o) =>
                          sum +
                          parseFloat(
                            o.priceSummary?.total?.amount ||
                              o.totalPrice?.amount ||
                              0,
                          ),
                        0,
                      );
                      const photoUrl = cust.profile?.photo?.url;
                      const displayName = cust.contact?.firstName
                        ? `${cust.contact.firstName} ${cust.contact.lastName || ""}`.trim()
                        : cust.profile?.nickname ||
                          cust.loginEmail?.split("@")[0] ||
                          "Kunde";
                      const email =
                        cust.loginEmail ||
                        cust.contact?.emails?.[0]?.email ||
                        "";
                      const phone = cust.contact?.phones?.[0] || "";
                      const addr = cust.contact?.addresses?.[0];
                      const addressStr = addr
                        ? `${addr.addressLine || ""}, ${addr.postalCode || ""} ${addr.city || ""}`
                            .replace(/^,\s*|,\s*$/g, "")
                            .trim()
                        : "";

                      return (
                        <tr
                          key={cust._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <button
                              onClick={() =>
                                setSelectedCustomerModal({
                                  customer: cust,
                                  orders: custOrders,
                                })
                              }
                              className="flex items-center gap-3 text-left group cursor-pointer"
                            >
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={displayName}
                                  className="w-10 h-10 rounded-full object-cover border border-outline-variant/50 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B4965]/10 to-[#d17d39]/15 text-[#1B4965] border border-[#1B4965]/20 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-onyx text-xs truncate max-w-[180px] group-hover:text-[#d17d39] transition-colors">
                                  {displayName}
                                </p>
                                {cust.profile?.title && (
                                  <p className="text-[10px] text-[#d17d39] font-semibold">
                                    {cust.profile.title}
                                  </p>
                                )}
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-0.5 ${
                                    cust.status === "APPROVED" ||
                                    cust.activityStatus === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-secondary"
                                  }`}
                                >
                                  {cust.status === "APPROVED"
                                    ? "Aktiv"
                                    : cust.status || "Medlem"}
                                </span>
                              </div>
                            </button>
                          </td>

                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              {email && (
                                <a
                                  href={`mailto:${email}`}
                                  className="text-xs text-onyx hover:text-[#d17d39] font-medium flex items-center gap-1.5 truncate max-w-[200px]"
                                >
                                  <Mail
                                    size={12}
                                    className="text-secondary shrink-0"
                                  />
                                  <span className="truncate">{email}</span>
                                </a>
                              )}
                              {phone && (
                                <a
                                  href={`tel:${phone}`}
                                  className="text-[11px] text-secondary hover:text-onyx flex items-center gap-1.5"
                                >
                                  <Phone
                                    size={11}
                                    className="text-secondary shrink-0"
                                  />
                                  <span>{phone}</span>
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {addressStr ? (
                              <div className="flex items-start gap-1.5 text-secondary text-xs max-w-[180px]">
                                <MapPin
                                  size={13}
                                  className="text-secondary shrink-0 mt-0.5"
                                />
                                <span className="truncate">{addressStr}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Ingen adresse lagret
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <p className="text-xs text-onyx font-medium">
                              {cust._createdDate
                                ? new Date(
                                    cust._createdDate,
                                  ).toLocaleDateString("no-NO", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </p>
                            {cust.lastLoginDate && (
                              <p className="text-[10px] text-secondary">
                                Sist:{" "}
                                {new Date(
                                  cust.lastLoginDate,
                                ).toLocaleDateString("no-NO", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </p>
                            )}
                          </td>

                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            {custOrders.length > 0 ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  <Check size={11} />
                                  <span>
                                    {custOrders.length}{" "}
                                    {custOrders.length === 1
                                      ? "ordre"
                                      : "ordrer"}
                                  </span>
                                </span>
                                <p className="text-xs font-bold text-onyx mt-1">
                                  {totalSpent.toLocaleString("no-NO")} kr
                                </p>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                0 ordrer
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <button
                              onClick={() =>
                                setSelectedCustomerModal({
                                  customer: cust,
                                  orders: custOrders,
                                })
                              }
                              className="px-3.5 py-2 bg-[#1B4965]/10 hover:bg-[#1B4965]/20 text-[#1B4965] hover:text-onyx rounded-xl font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95 shadow-sm"
                            >
                              <Eye size={14} />
                              <span>
                                {custOrders.length > 0
                                  ? `Se profil & ordrer (${custOrders.length})`
                                  : "Se kundeprofil"}
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
