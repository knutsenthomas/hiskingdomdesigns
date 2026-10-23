import React from "react";
import {
  ClipboardList,
  ChevronRight,
  Users,
  Search,
  RefreshCw,
  Check,
  Mail,
  ChevronUp,
  ChevronDown,
  MapPin,
  Share2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function AffiliateApplications({
  activeSubTab,
  approvedCount,
  expandedId,
  filteredApplications,
  handleApprove,
  handleReject,
  isLoading,
  pendingCount,
  searchQuery,
  setActiveSubTab,
  setExpandedId,
  setRefreshKey,
  setSearchQuery,
}) {
  return (
    <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-sm space-y-6">
      {/* Stats Counter Sub-row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardList size={18} />
            </div>
            <div>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                Søknader til behandling
              </p>
              <p className="text-lg font-extrabold text-[#1B4965]">
                {pendingCount}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-secondary/50" />
        </div>

        <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                Godkjente affiliates
              </p>
              <p className="text-lg font-extrabold text-[#1B4965]">
                {approvedCount}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-secondary/50" />
        </div>
      </div>

      {/* Navigation Tabs and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0">
          <button
            onClick={() => {
              setActiveSubTab("pending");
              setSearchQuery("");
              setExpandedId(null);
            }}
            className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "pending"
                ? "bg-[#d17d39] text-white shadow-sm"
                : "text-secondary hover:text-onyx"
            }`}
          >
            Nye søknader
          </button>
          <button
            onClick={() => {
              setActiveSubTab("approved");
              setSearchQuery("");
              setExpandedId(null);
            }}
            className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "approved"
                ? "bg-[#d17d39] text-white shadow-sm"
                : "text-secondary hover:text-onyx"
            }`}
          >
            Godkjente affiliates
          </button>
        </div>

        {/* Search bar and refresh */}
        <div className="flex gap-2 w-full md:w-fit">
          <div className="relative flex-grow md:w-64">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary"
            />
            <input
              type="text"
              placeholder="Søk på navn, epost..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-[#1B4965]/50"
            />
          </div>
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="bg-slate-50 hover:bg-slate-100 text-secondary hover:text-onyx p-2.5 border border-outline-variant/60 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Oppdater liste"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#1B4965] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-secondary text-xs font-semibold">
            Henter søknader...
          </p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="py-24 text-center text-secondary space-y-2">
          <span className="material-symbols-outlined text-4xl text-slate-300 select-none">
            inbox
          </span>
          <p className="text-xs font-semibold">
            {searchQuery
              ? "Ingen søknader matcher søket ditt."
              : activeSubTab === "pending"
                ? "Ingen ubehandlede søknader for øyeblikket!"
                : "Ingen godkjente affiliates registrert ennå."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredApplications.map((app) => {
              const isExpanded = expandedId === app.id;
              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-50 rounded-2xl border border-outline-variant/20 p-4 hover:border-[#1B4965]/20 hover:shadow-sm transition-all text-left"
                >
                  {/* Compact row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className="flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-onyx text-sm md:text-base">
                            {app.name}
                          </span>
                          {app.status === "approved" ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 border border-emerald-200">
                              <Check size={8} strokeWidth={3} />
                              Godkjent
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-amber-200">
                              Søknad
                            </span>
                          )}
                        </div>
                        <p className="text-secondary flex items-center gap-1.5 text-xs font-medium">
                          <Mail size={12} className="shrink-0 text-[#1B4965]" />
                          {app.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {app.appliedAt && (
                        <span className="text-[10px] text-secondary/60 hidden sm:inline">
                          {new Date(app.appliedAt).toLocaleDateString("no-NO")}
                        </span>
                      )}
                      <div className="text-secondary hover:text-[#1B4965] p-1 rounded-lg hover:bg-slate-100/50 transition-colors">
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detailed info */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-slate-100/60 space-y-4 mt-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <span className="font-bold flex items-center gap-1.5 text-xs text-secondary">
                                <MapPin size={12} className="text-[#1B4965]" />
                                Adresse:
                              </span>
                              <p className="text-secondary pl-4.5 font-medium">
                                {app.address}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="font-bold flex items-center gap-1.5 text-xs text-secondary">
                                <Share2 size={12} className="text-[#1B4965]" />
                                Sosiale Medier-kontoer:
                              </span>
                              <p className="text-secondary pl-4.5 font-medium">
                                {app.socialMedia}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold flex items-center gap-1.5 text-xs text-secondary">
                              <ClipboardList
                                size={12}
                                className="text-[#1B4965]"
                              />
                              Søkers begrunnelse:
                            </span>
                            <p className="text-secondary leading-relaxed bg-white p-4 rounded-xl border border-slate-200/50 pl-4 text-xs">
                              {app.motivation}
                            </p>
                          </div>

                          {app.appliedAt && (
                            <div className="text-[10px] text-secondary/60 text-right">
                              Søkt:{" "}
                              {new Date(app.appliedAt).toLocaleDateString(
                                "no-NO",
                              )}{" "}
                              kl.{" "}
                              {new Date(app.appliedAt).toLocaleTimeString(
                                "no-NO",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                          )}

                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/50">
                            {activeSubTab === "pending" && (
                              <button
                                onClick={() => handleApprove(app.id, app.name)}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Check size={14} />
                                <span>Godkjenn søknad</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleReject(app.id, app.name)}
                              className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <X size={14} />
                              <span>
                                {activeSubTab === "pending"
                                  ? "Avvis søknad"
                                  : "Fjern affiliate"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
