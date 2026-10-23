import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, MapPin, ShoppingBag, ExternalLink } from "lucide-react";

export default function CustomerPreview({
  selectedCustomerModal,
  setSelectedCustomerModal,
}) {
  return (
    <AnimatePresence>
      {selectedCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto text-left space-y-6"
          >
            {/* Header with Avatar and Basic Info */}
            <div className="flex justify-between items-start border-b border-outline-variant/30 pb-5">
              <div className="flex items-center gap-4 min-w-0">
                {selectedCustomerModal.customer.profile?.photo?.url ? (
                  <img
                    src={selectedCustomerModal.customer.profile.photo.url}
                    alt="Profil"
                    className="w-14 h-14 rounded-full object-cover border-2 border-outline-variant/40 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B4965] to-[#d17d39] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                    {(
                      selectedCustomerModal.customer.contact?.firstName ||
                      selectedCustomerModal.customer.profile?.nickname ||
                      selectedCustomerModal.customer.loginEmail ||
                      "K"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-onyx truncate">
                      {selectedCustomerModal.customer.contact?.firstName
                        ? `${selectedCustomerModal.customer.contact.firstName} ${selectedCustomerModal.customer.contact.lastName || ""}`.trim()
                        : selectedCustomerModal.customer.profile?.nickname ||
                          selectedCustomerModal.customer.loginEmail}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        selectedCustomerModal.customer.status === "APPROVED" ||
                        selectedCustomerModal.customer.activityStatus ===
                          "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-secondary"
                      }`}
                    >
                      {selectedCustomerModal.customer.status === "APPROVED"
                        ? "Aktiv konto"
                        : selectedCustomerModal.customer.status || "Medlem"}
                    </span>
                  </div>
                  {selectedCustomerModal.customer.profile?.title && (
                    <p className="text-xs text-[#d17d39] font-bold mt-0.5">
                      {selectedCustomerModal.customer.profile.title}
                    </p>
                  )}
                  <p className="text-xs text-secondary mt-0.5 truncate">
                    Bruker-ID:{" "}
                    <span className="font-mono text-[10px] text-slate-500">
                      {selectedCustomerModal.customer._id}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="p-2 rounded-xl text-secondary hover:text-onyx hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-outline-variant/40">
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                  Totalt handlet
                </span>
                <p className="text-base font-extrabold text-onyx mt-0.5">
                  {selectedCustomerModal.orders
                    .reduce(
                      (sum, o) =>
                        sum +
                        parseFloat(
                          o.priceSummary?.total?.amount ||
                            o.totalPrice?.amount ||
                            0,
                        ),
                      0,
                    )
                    .toLocaleString("no-NO")}{" "}
                  kr
                </p>
              </div>
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                  Fullførte ordrer
                </span>
                <p className="text-base font-extrabold text-onyx mt-0.5">
                  {selectedCustomerModal.orders.length} stk
                </p>
              </div>
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                  Medlem siden
                </span>
                <p className="text-xs font-bold text-onyx mt-1">
                  {selectedCustomerModal.customer._createdDate
                    ? new Date(
                        selectedCustomerModal.customer._createdDate,
                      ).toLocaleDateString("no-NO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                  Sist innlogget
                </span>
                <p className="text-xs font-bold text-onyx mt-1">
                  {selectedCustomerModal.customer.lastLoginDate
                    ? new Date(
                        selectedCustomerModal.customer.lastLoginDate,
                      ).toLocaleDateString("no-NO", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "Ikke logget"}
                </p>
              </div>
            </div>

            {/* Contact & Address Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-outline-variant/40 bg-white space-y-2">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={12} className="text-[#1B4965]" />
                  Kontaktinformasjon
                </p>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-secondary text-[11px]">E-post:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={`mailto:${selectedCustomerModal.customer.loginEmail || selectedCustomerModal.customer.contact?.emails?.[0]?.email}`}
                        className="font-bold text-onyx hover:text-[#d17d39] truncate"
                      >
                        {selectedCustomerModal.customer.loginEmail ||
                          selectedCustomerModal.customer.contact?.emails?.[0]
                            ?.email ||
                          "Ingen e-post"}
                      </a>
                    </div>
                  </div>
                  {selectedCustomerModal.customer.contact?.phones?.[0] && (
                    <div>
                      <span className="text-secondary text-[11px]">
                        Telefon:
                      </span>
                      <div className="mt-0.5">
                        <a
                          href={`tel:${selectedCustomerModal.customer.contact.phones[0]}`}
                          className="font-bold text-onyx hover:text-[#d17d39]"
                        >
                          {selectedCustomerModal.customer.contact.phones[0]}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-outline-variant/40 bg-white space-y-2">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#d17d39]" />
                  Leveringsadresse
                </p>
                {selectedCustomerModal.customer.contact?.addresses?.[0] ? (
                  <div className="text-xs space-y-0.5 text-onyx font-medium">
                    <p>
                      {selectedCustomerModal.customer.contact.addresses[0]
                        .addressLine || ""}
                    </p>
                    <p>
                      {selectedCustomerModal.customer.contact.addresses[0]
                        .postalCode || ""}{" "}
                      {selectedCustomerModal.customer.contact.addresses[0]
                        .city || ""}
                    </p>
                    <p className="text-secondary text-[11px]">
                      {selectedCustomerModal.customer.contact.addresses[0]
                        .country || "Norge"}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Ingen fast leveringsadresse registrert ennå.
                  </p>
                )}
              </div>
            </div>

            {/* Orders History Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-[#1B4965]" />
                  Bestillinger ({selectedCustomerModal.orders.length})
                </h4>
              </div>

              {selectedCustomerModal.orders.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-outline-variant/30 text-center space-y-1">
                  <p className="text-xs font-bold text-onyx">
                    Ingen registrerte bestillinger ennå
                  </p>
                  <p className="text-[11px] text-secondary">
                    Kunden har opprettet medlemskonto, men har foreløpig ikke
                    lagt inn ordre i butikken.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCustomerModal.orders.map((order, idx) => (
                    <div
                      key={order._id || idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-outline-variant/40 space-y-3"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-onyx">
                            Ordre #{order.number || order._id?.substring(0, 8)}
                          </span>
                          <span className="text-secondary ml-2">
                            {order._createdDate
                              ? new Date(order._createdDate).toLocaleDateString(
                                  "no-NO",
                                )
                              : ""}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            order.status === "PAID" ||
                            order.status === "FULFILLED" ||
                            order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {order.status === "PAID"
                            ? "Betalt"
                            : order.status === "DELIVERED"
                              ? "Sendt"
                              : order.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {(order.lineItems || []).map((li, lIdx) => (
                          <div
                            key={lIdx}
                            className="flex justify-between items-center text-xs text-secondary"
                          >
                            <span className="truncate max-w-[280px]">
                              {li.quantity}x{" "}
                              {li.productName?.original || li.name}
                            </span>
                            <span className="font-semibold text-onyx">
                              {li.totalPrice?.amount
                                ? `${parseFloat(li.totalPrice.amount).toLocaleString("no-NO")} kr`
                                : ""}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
                        <span className="font-bold text-secondary">
                          Totalsum for ordre:
                        </span>
                        <span className="font-extrabold text-sm text-onyx">
                          {parseFloat(
                            order.priceSummary?.total?.amount ||
                              order.totalPrice?.amount ||
                              0,
                          ).toLocaleString("no-NO")}{" "}
                          kr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-outline-variant/30">
              <a
                href={`https://manage.wix.com/dashboard/7682a906-41f6-4e8d-b0b1-bfdb5ee596e7/contacts?contactId=${selectedCustomerModal.customer.contactId || selectedCustomerModal.customer._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-onyx text-xs font-medium inline-flex items-center gap-1.5"
              >
                <span>Åpne kunden i Wix Studio</span>
                <ExternalLink size={12} />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {(selectedCustomerModal.customer.loginEmail ||
                  selectedCustomerModal.customer.contact?.emails?.[0]
                    ?.email) && (
                  <a
                    href={`mailto:${selectedCustomerModal.customer.loginEmail || selectedCustomerModal.customer.contact?.emails?.[0]?.email}`}
                    className="bg-[#1B4965] hover:bg-[#153a50] text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Mail size={13} />
                    <span>Send e-post</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedCustomerModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-onyx px-5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Lukk
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
